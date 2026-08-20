using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Entities.Inventory;
using Vector.Api.Entities.Maintenance;
using Vector.Api.Models.Common;
using Vector.Api.Models.Maintenance;
using Vector.Api.Services.Auth;

namespace Vector.Api.Services.Maintenance
{
    public class MaintenanceWorkOrderService : IMaintenanceWorkOrderService
    {
        private const string CostViewScope = "maintenance.cost.view";
        private const string SuperAdminScope = "super.admin";
        private const string MechanicRoleName = "Mechanic";

        private static readonly Dictionary<MaintenanceWorkOrderStatus, MaintenanceWorkOrderStatus[]> AllowedTransitions = new()
        {
            [MaintenanceWorkOrderStatus.Open] = new[] { MaintenanceWorkOrderStatus.InProgress, MaintenanceWorkOrderStatus.Cancelled },
            [MaintenanceWorkOrderStatus.InProgress] = new[] { MaintenanceWorkOrderStatus.OnHold, MaintenanceWorkOrderStatus.Completed, MaintenanceWorkOrderStatus.Cancelled },
            [MaintenanceWorkOrderStatus.OnHold] = new[] { MaintenanceWorkOrderStatus.InProgress, MaintenanceWorkOrderStatus.Cancelled },
            [MaintenanceWorkOrderStatus.Completed] = new[] { MaintenanceWorkOrderStatus.Closed },
            [MaintenanceWorkOrderStatus.Closed] = Array.Empty<MaintenanceWorkOrderStatus>(),
            [MaintenanceWorkOrderStatus.Cancelled] = Array.Empty<MaintenanceWorkOrderStatus>(),
        };

        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserPermissionService _permissionService;

        public MaintenanceWorkOrderService(ApplicationDbContext context, ICurrentUserPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        public async Task<List<MechanicOptionDto>> GetMechanicsAsync(Guid organizationId)
        {
            return await _context.OrganizationMembers
                .Where(om => om.OrganizationId == organizationId && om.Role!.Name == MechanicRoleName)
                .Select(om => new MechanicOptionDto
                {
                    Id = om.UserId,
                    FullName = om.User!.FullName
                })
                .ToListAsync();
        }

        public async Task<IQueryable<MaintenanceWorkOrderListDto>> GetQueryableAsync(Guid organizationId, Guid userId)
        {
            var canSeeCost = await _permissionService.HasPermissionAsync(organizationId, userId, CostViewScope);

            return _context.MaintenanceWorkOrders
                .Where(w => w.OrganizationId == organizationId)
                .Select(w => new MaintenanceWorkOrderListDto
                {
                    Id = w.Id,
                    EquipmentId = w.EquipmentId,
                    EquipmentName = w.Equipment != null ? w.Equipment.Name : null,
                    AccountId = w.AccountId,
                    AccountName = w.Account != null ? w.Account.CompanyName : null,
                    Title = w.Title,
                    Status = w.Status,
                    AssignedToUserId = w.AssignedToUserId,
                    AssignedToUserName = w.AssignedToUser != null ? w.AssignedToUser.FullName : null,
                    RequestedAt = w.RequestedAt,
                    CompletedAt = w.CompletedAt,
                    ClosedAt = w.ClosedAt,
                    LaborCost = canSeeCost ? w.LaborCost : null,
                    CreatedAt = w.CreatedAt
                });
        }

        public async Task<MaintenanceWorkOrderDto?> GetByIdAsync(Guid organizationId, Guid userId, Guid id)
        {
            var canSeeCost = await _permissionService.HasPermissionAsync(organizationId, userId, CostViewScope);

            var dto = await _context.MaintenanceWorkOrders
                .Where(w => w.OrganizationId == organizationId && w.Id == id)
                .Select(w => new MaintenanceWorkOrderDto
                {
                    Id = w.Id,
                    EquipmentId = w.EquipmentId,
                    EquipmentName = w.Equipment != null ? w.Equipment.Name : null,
                    AccountId = w.AccountId,
                    AccountName = w.Account != null ? w.Account.CompanyName : null,
                    Title = w.Title,
                    Description = w.Description,
                    Status = w.Status,
                    AssignedToUserId = w.AssignedToUserId,
                    AssignedToUserName = w.AssignedToUser != null ? w.AssignedToUser.FullName : null,
                    RequestedAt = w.RequestedAt,
                    StartedAt = w.StartedAt,
                    CompletedAt = w.CompletedAt,
                    ClosedAt = w.ClosedAt,
                    LaborCost = w.LaborCost,
                    Currency = w.Currency,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = w.UpdatedAt,
                    Items = w.Items.Select(i => new MaintenanceWorkOrderItemDto
                    {
                        Id = i.Id,
                        Type = i.Type,
                        ProductId = i.ProductId,
                        ProductName = i.Product != null ? i.Product.Name : null,
                        Description = i.Description,
                        Quantity = i.Quantity,
                        UnitCost = i.UnitCost,
                        Currency = i.Currency,
                        TotalCost = i.TotalCost,
                        RemovedAt = i.RemovedAt,
                        Note = i.Note,
                        CreatedAt = i.CreatedAt,
                        CreatedById = i.CreatedById
                    }).ToList(),
                    Notes = w.Notes
                        .OrderBy(n => n.CreatedAt)
                        .Select(n => new MaintenanceNoteDto
                        {
                            Id = n.Id,
                            Body = n.Body,
                            CreatedAt = n.CreatedAt,
                            CreatedById = n.CreatedById,
                            CreatedByName = n.CreatedBy != null ? n.CreatedBy.FullName : null
                        }).ToList()
                })
                .FirstOrDefaultAsync();

            if (dto == null) return null;

            if (!canSeeCost)
            {
                dto.LaborCost = null;
                foreach (var item in dto.Items)
                {
                    item.UnitCost = null;
                    item.TotalCost = null;
                }
            }

            return dto;
        }

        public async Task<Result<MaintenanceWorkOrderDto>> CreateAsync(Guid organizationId, Guid userId, CreateMaintenanceWorkOrderRequest request)
        {
            var equipment = await _context.Equipment
                .FirstOrDefaultAsync(e => e.OrganizationId == organizationId && e.Id == request.EquipmentId);

            if (equipment == null)
                return Result<MaintenanceWorkOrderDto>.Failure("Equipment not found.", 404);

            if (request.AssignedToUserId.HasValue)
            {
                var isMechanic = await IsMechanicMemberAsync(organizationId, request.AssignedToUserId.Value);
                if (!isMechanic)
                    return Result<MaintenanceWorkOrderDto>.Failure("Assigned user is not a Mechanic in this organization.", 400);
            }

            var entity = new MaintenanceWorkOrderEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                EquipmentId = equipment.Id,
                AccountId = equipment.AccountId,
                Title = request.Title,
                Description = request.Description,
                Status = MaintenanceWorkOrderStatus.Open,
                AssignedToUserId = request.AssignedToUserId,
                CreatedById = userId
            };

            _context.MaintenanceWorkOrders.Add(entity);
            await _context.SaveChangesAsync();

            var dto = await GetByIdAsync(organizationId, userId, entity.Id);
            return Result<MaintenanceWorkOrderDto>.Success(dto!, "Work order created successfully.", 201);
        }

        public async Task<Result<MaintenanceWorkOrderDto>> AssignAsync(Guid organizationId, Guid userId, Guid workOrderId, AssignWorkOrderRequest request)
        {
            var entity = await _context.MaintenanceWorkOrders
                .FirstOrDefaultAsync(w => w.OrganizationId == organizationId && w.Id == workOrderId);

            if (entity == null)
                return Result<MaintenanceWorkOrderDto>.Failure("Work order not found.", 404);

            var ownershipCheck = await CheckOwnershipAsync(organizationId, userId, entity);
            if (ownershipCheck != null)
                return Result<MaintenanceWorkOrderDto>.Failure(ownershipCheck, 403);

            var isMechanic = await IsMechanicMemberAsync(organizationId, request.AssignedToUserId);
            if (!isMechanic)
                return Result<MaintenanceWorkOrderDto>.Failure("Assigned user is not a Mechanic in this organization.", 400);

            entity.AssignedToUserId = request.AssignedToUserId;
            entity.UpdatedById = userId;

            await _context.SaveChangesAsync();

            var dto = await GetByIdAsync(organizationId, userId, entity.Id);
            return Result<MaintenanceWorkOrderDto>.Success(dto!, "Work order assigned successfully.");
        }

        public async Task<Result<MaintenanceWorkOrderDto>> ChangeStatusAsync(Guid organizationId, Guid userId, Guid workOrderId, ChangeWorkOrderStatusRequest request)
        {
            var entity = await _context.MaintenanceWorkOrders
                .FirstOrDefaultAsync(w => w.OrganizationId == organizationId && w.Id == workOrderId);

            if (entity == null)
                return Result<MaintenanceWorkOrderDto>.Failure("Work order not found.", 404);

            var ownershipCheck = await CheckOwnershipAsync(organizationId, userId, entity);
            if (ownershipCheck != null)
                return Result<MaintenanceWorkOrderDto>.Failure(ownershipCheck, 403);

            if (!AllowedTransitions.TryGetValue(entity.Status, out var allowed) || !allowed.Contains(request.Status))
                return Result<MaintenanceWorkOrderDto>.Failure($"Cannot transition from '{entity.Status}' to '{request.Status}'.", 400);

            entity.Status = request.Status;
            entity.UpdatedById = userId;

            switch (request.Status)
            {
                case MaintenanceWorkOrderStatus.InProgress:
                    entity.StartedAt ??= DateTime.UtcNow;
                    break;
                case MaintenanceWorkOrderStatus.Completed:
                    entity.CompletedAt = DateTime.UtcNow;
                    break;
                case MaintenanceWorkOrderStatus.Closed:
                    entity.ClosedAt = DateTime.UtcNow;
                    break;
            }

            await _context.SaveChangesAsync();

            var dto = await GetByIdAsync(organizationId, userId, entity.Id);
            return Result<MaintenanceWorkOrderDto>.Success(dto!, "Work order status updated successfully.");
        }

        public async Task<Result<MaintenanceWorkOrderItemDto>> AddItemAsync(Guid organizationId, Guid userId, Guid workOrderId, AddWorkOrderItemRequest request)
        {
            var workOrder = await _context.MaintenanceWorkOrders
                .FirstOrDefaultAsync(w => w.OrganizationId == organizationId && w.Id == workOrderId);

            if (workOrder == null)
                return Result<MaintenanceWorkOrderItemDto>.Failure("Work order not found.", 404);

            var ownershipCheck = await CheckOwnershipAsync(organizationId, userId, workOrder);
            if (ownershipCheck != null)
                return Result<MaintenanceWorkOrderItemDto>.Failure(ownershipCheck, 403);

            var item = new MaintenanceWorkOrderItemEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                WorkOrderId = workOrder.Id,
                Type = request.Type,
                Quantity = request.Quantity,
                Note = request.Note,
                CreatedById = userId
            };

            if (request.Type == MaintenanceWorkOrderItemType.Part)
            {
                if (!request.ProductId.HasValue)
                    return Result<MaintenanceWorkOrderItemDto>.Failure("ProductId is required for part items.", 400);

                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == request.ProductId.Value);

                if (product == null)
                    return Result<MaintenanceWorkOrderItemDto>.Failure("Product not found.", 404);

                if (product.StockQuantity < request.Quantity)
                    return Result<MaintenanceWorkOrderItemDto>.Failure($"Insufficient stock for '{product.Name}'. Requested: {request.Quantity}, Available: {product.StockQuantity}", 400);

                var warehouse = await _context.Warehouses
                    .Where(w => w.OrganizationId == organizationId)
                    .OrderByDescending(w => w.IsDefault)
                    .FirstOrDefaultAsync();

                var unitCost = product.AvgCost;

                product.StockQuantity -= request.Quantity;
                product.UpdatedById = userId;

                var movement = new StockMovementEntity
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    ProductId = product.Id,
                    Quantity = request.Quantity,
                    UnitCost = unitCost,
                    TotalCost = unitCost.HasValue ? request.Quantity * unitCost.Value : null,
                    Type = StockMovementType.Out,
                    AccountId = workOrder.AccountId,
                    WarehouseId = warehouse?.Id,
                    WorkOrderId = workOrder.Id,
                    Note = $"Bakım iş emri: {workOrder.Title}",
                    CreatedById = userId
                };
                _context.StockMovements.Add(movement);

                item.ProductId = product.Id;
                item.UnitCost = unitCost;
                item.TotalCost = unitCost.HasValue ? request.Quantity * unitCost.Value : null;
                item.Currency = product.SellingCurrency;
                item.StockMovementId = movement.Id;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.Description))
                    return Result<MaintenanceWorkOrderItemDto>.Failure("Description is required for labor items.", 400);

                if (!request.UnitCost.HasValue)
                    return Result<MaintenanceWorkOrderItemDto>.Failure("UnitCost is required for labor items.", 400);

                item.Description = request.Description;
                item.UnitCost = request.UnitCost;
                item.TotalCost = request.UnitCost.Value * request.Quantity;
            }

            _context.MaintenanceWorkOrderItems.Add(item);
            await _context.SaveChangesAsync();

            var canSeeCost = await _permissionService.HasPermissionAsync(organizationId, userId, CostViewScope);
            var dto = new MaintenanceWorkOrderItemDto
            {
                Id = item.Id,
                Type = item.Type,
                ProductId = item.ProductId,
                ProductName = item.Type == MaintenanceWorkOrderItemType.Part
                    ? (await _context.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId))?.Name
                    : null,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitCost = canSeeCost ? item.UnitCost : null,
                Currency = item.Currency,
                TotalCost = canSeeCost ? item.TotalCost : null,
                Note = item.Note,
                CreatedAt = item.CreatedAt,
                CreatedById = item.CreatedById
            };

            return Result<MaintenanceWorkOrderItemDto>.Success(dto, "Item added successfully.", 201);
        }

        public async Task<Result<bool>> RemoveItemAsync(Guid organizationId, Guid userId, Guid workOrderId, Guid itemId)
        {
            var workOrder = await _context.MaintenanceWorkOrders
                .FirstOrDefaultAsync(w => w.OrganizationId == organizationId && w.Id == workOrderId);

            if (workOrder == null)
                return Result<bool>.Failure("Work order not found.", 404);

            var ownershipCheck = await CheckOwnershipAsync(organizationId, userId, workOrder);
            if (ownershipCheck != null)
                return Result<bool>.Failure(ownershipCheck, 403);

            var item = await _context.MaintenanceWorkOrderItems
                .FirstOrDefaultAsync(i => i.OrganizationId == organizationId && i.WorkOrderId == workOrderId && i.Id == itemId);

            if (item == null || item.RemovedAt != null)
                return Result<bool>.Failure("Item not found.", 404);

            if (item.Type == MaintenanceWorkOrderItemType.Part && item.ProductId.HasValue)
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == item.ProductId.Value);

                if (product != null)
                {
                    product.StockQuantity += item.Quantity;
                    product.UpdatedById = userId;

                    var originalMovement = item.StockMovementId.HasValue
                        ? await _context.StockMovements.FirstOrDefaultAsync(m => m.Id == item.StockMovementId.Value)
                        : null;

                    var reversal = new StockMovementEntity
                    {
                        Id = Guid.NewGuid(),
                        OrganizationId = organizationId,
                        ProductId = product.Id,
                        Quantity = item.Quantity,
                        UnitCost = item.UnitCost,
                        TotalCost = item.TotalCost,
                        Type = StockMovementType.In,
                        AccountId = workOrder.AccountId,
                        WarehouseId = originalMovement?.WarehouseId,
                        WorkOrderId = workOrder.Id,
                        Note = $"Bakım iş emrinden parça iadesi: {workOrder.Title}",
                        CreatedById = userId
                    };
                    _context.StockMovements.Add(reversal);
                }
            }

            item.RemovedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true, "Item removed successfully.");
        }

        public async Task<Result<MaintenanceNoteDto>> AddNoteAsync(Guid organizationId, Guid userId, Guid workOrderId, AddMaintenanceNoteRequest request)
        {
            var workOrder = await _context.MaintenanceWorkOrders
                .FirstOrDefaultAsync(w => w.OrganizationId == organizationId && w.Id == workOrderId);

            if (workOrder == null)
                return Result<MaintenanceNoteDto>.Failure("Work order not found.", 404);

            var ownershipCheck = await CheckOwnershipAsync(organizationId, userId, workOrder);
            if (ownershipCheck != null)
                return Result<MaintenanceNoteDto>.Failure(ownershipCheck, 403);

            var note = new MaintenanceNoteEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                WorkOrderId = workOrder.Id,
                Body = request.Body,
                CreatedById = userId
            };

            _context.MaintenanceNotes.Add(note);
            await _context.SaveChangesAsync();

            var createdBy = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            var dto = new MaintenanceNoteDto
            {
                Id = note.Id,
                Body = note.Body,
                CreatedAt = note.CreatedAt,
                CreatedById = note.CreatedById,
                CreatedByName = createdBy?.FullName
            };

            return Result<MaintenanceNoteDto>.Success(dto, "Note added successfully.", 201);
        }

        private async Task<string?> CheckOwnershipAsync(Guid organizationId, Guid userId, MaintenanceWorkOrderEntity workOrder)
        {
            var isSuperAdmin = await _permissionService.HasPermissionAsync(organizationId, userId, SuperAdminScope);
            if (isSuperAdmin) return null;

            if (workOrder.AssignedToUserId == userId) return null;

            return "You can only manage work orders assigned to you.";
        }

        private async Task<bool> IsMechanicMemberAsync(Guid organizationId, Guid userId)
        {
            return await _context.OrganizationMembers
                .Where(om => om.OrganizationId == organizationId && om.UserId == userId)
                .Select(om => om.Role!.Name)
                .AnyAsync(name => name == MechanicRoleName);
        }
    }
}
