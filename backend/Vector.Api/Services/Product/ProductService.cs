using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Entities;
using Vector.Api.Models.Product;
using Vector.Api.Models.Stock;

namespace Vector.Api.Services.Product
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<ProductListDto> GetQueryable(Guid organizationId)
        {
            return _context.Products
                .Where(p => p.OrganizationId == organizationId)
                .Select(p => new ProductListDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Unit = p.Unit,
                    SalePrice = p.SalePrice,
                    SellingCurrency = p.SellingCurrency,
                    IsActive = p.IsActive,
                    StockQuantity = p.StockQuantity,
                    AvgCost = p.AvgCost,
                    LastPurchasePrice = p.LastPurchasePrice,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    GroupId = p.GroupId,
                    GroupName = p.Group != null ? p.Group.Name : null,
                    ImageUrl = p.ImageUrl
                });
        }

        public async Task<ProductDto?> GetByIdAsync(Guid organizationId, Guid id)
        {
            return await _context.Products
                .Include(p => p.Group)
                .Include(p => p.ComponentBomItems.Where(b => b.DeletedAt == null))
                    .ThenInclude(b => b.ComponentProduct)
                .Where(p => p.OrganizationId == organizationId && p.Id == id)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    Unit = p.Unit,
                    SalePrice = p.SalePrice,
                    SellingCurrency = p.SellingCurrency,
                    IsActive = p.IsActive,
                    StockQuantity = p.StockQuantity,
                    AvgCost = p.AvgCost,
                    LastPurchasePrice = p.LastPurchasePrice,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    GroupId = p.GroupId,
                    GroupName = p.Group != null ? p.Group.Name : null,
                    ImageUrl = p.ImageUrl,
                    BomItems = p.ComponentBomItems.Where(b => b.DeletedAt == null).Select(b => new BomItemDto
                    {
                        Id = b.Id,
                        ComponentProductId = b.ComponentProductId,
                        ComponentProductCode = b.ComponentProduct!.Code,
                        ComponentProductName = b.ComponentProduct.Name,
                        ComponentProductUnit = b.ComponentProduct.Unit,
                        Quantity = b.Quantity,
                        Notes = b.Notes,
                        CreatedAt = b.CreatedAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ProductDto> CreateAsync(Guid organizationId, Guid userId, CreateProductRequest request)
        {
            var entity = new ProductEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Code = request.Code,
                Name = request.Name,
                Description = request.Description,
                Unit = request.Unit,
                SalePrice = request.SalePrice,
                SellingCurrency = request.SellingCurrency,
                GroupId = request.GroupId,
                ImageUrl = request.ImageUrl,
                CreatedById = userId
            };

            _context.Products.Add(entity);
            await _context.SaveChangesAsync();

            return new ProductDto
            {
                Id = entity.Id,
                Code = entity.Code,
                Name = entity.Name,
                Description = entity.Description,
                Unit = entity.Unit,
                SalePrice = entity.SalePrice,
                SellingCurrency = entity.SellingCurrency,
                IsActive = entity.IsActive,
                StockQuantity = entity.StockQuantity,
                AvgCost = entity.AvgCost,
                LastPurchasePrice = entity.LastPurchasePrice,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                GroupId = entity.GroupId,
                ImageUrl = entity.ImageUrl
            };
        }

        public async Task<ProductDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateProductRequest request)
        {
            var entity = await _context.Products
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == id);

            if (entity == null) return null;

            entity.Name = request.Name;
            entity.Description = request.Description;
            entity.Unit = request.Unit;
            entity.SalePrice = request.SalePrice;
            entity.SellingCurrency = request.SellingCurrency;
            entity.IsActive = request.IsActive;
            entity.GroupId = request.GroupId;
            entity.ImageUrl = request.ImageUrl;
            entity.UpdatedById = userId;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(organizationId, id);
        }

        public async Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id)
        {
            var entity = await _context.Products
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == id);

            if (entity == null) return false;

            _context.Products.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BomTreeDto> GetBomTreeAsync(Guid organizationId, Guid productId)
        {
            var allBomItems = await _context.BomItems
                .Where(b => b.OrganizationId == organizationId && b.DeletedAt == null)
                .ToListAsync();

            var productIds = new HashSet<Guid>();
            void CollectIds(Guid pid)
            {
                if (!productIds.Add(pid)) return;
                foreach (var item in allBomItems.Where(b => b.ParentProductId == pid))
                    CollectIds(item.ComponentProductId);
            }
            CollectIds(productId);
            productIds.Add(productId);

            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var nodes = new List<BomTreeNodeDto>();
            var edges = new List<BomTreeEdgeDto>();
            var visited = new HashSet<Guid>();

            void BuildTree(Guid pid, decimal quantity, bool isRoot)
            {
                if (!visited.Add(pid)) return;
                if (!products.TryGetValue(pid, out var prod)) return;

                nodes.Add(new BomTreeNodeDto
                {
                    Id = pid,
                    ProductCode = prod.Code,
                    ProductName = prod.Name,
                    ProductUnit = prod.Unit,
                    Quantity = quantity,
                    IsRoot = isRoot
                });

                foreach (var item in allBomItems.Where(b => b.ParentProductId == pid))
                {
                    edges.Add(new BomTreeEdgeDto
                    {
                        Id = item.Id,
                        SourceId = pid,
                        TargetId = item.ComponentProductId,
                        Quantity = item.Quantity
                    });
                    BuildTree(item.ComponentProductId, item.Quantity, false);
                }
            }

            BuildTree(productId, 1, true);

            return new BomTreeDto { Nodes = nodes, Edges = edges };
        }

        public async Task<BomItemDto?> CreateBomItemAsync(Guid organizationId, Guid productId, CreateBomItemRequest request)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == productId);

            if (product == null) return null;

            var component = await _context.Products
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == request.ComponentProductId);

            if (component == null) return null;

            if (productId == request.ComponentProductId)
                return null;

            if (await HasCircularReferenceAsync(organizationId, productId, request.ComponentProductId))
                return null;

            var existingBom = await _context.BomItems
                .FirstOrDefaultAsync(b =>
                    b.OrganizationId == organizationId &&
                    b.ParentProductId == productId &&
                    b.ComponentProductId == request.ComponentProductId &&
                    b.DeletedAt == null);

            if (existingBom != null)
            {
                existingBom.Quantity += request.Quantity;
                existingBom.Notes = request.Notes ?? existingBom.Notes;
                await _context.SaveChangesAsync();

                return new BomItemDto
                {
                    Id = existingBom.Id,
                    ComponentProductId = component.Id,
                    ComponentProductCode = component.Code,
                    ComponentProductName = component.Name,
                    ComponentProductUnit = component.Unit,
                    Quantity = existingBom.Quantity,
                    Notes = existingBom.Notes,
                    CreatedAt = existingBom.CreatedAt
                };
            }

            var bomItem = new BomItemEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                ParentProductId = productId,
                ComponentProductId = request.ComponentProductId,
                Quantity = request.Quantity,
                Notes = request.Notes
            };

            _context.BomItems.Add(bomItem);
            await _context.SaveChangesAsync();

            return new BomItemDto
            {
                Id = bomItem.Id,
                ComponentProductId = component.Id,
                ComponentProductCode = component.Code,
                ComponentProductName = component.Name,
                ComponentProductUnit = component.Unit,
                Quantity = bomItem.Quantity,
                Notes = bomItem.Notes,
                CreatedAt = bomItem.CreatedAt
            };
        }

        public async Task<BomItemDto?> UpdateBomItemAsync(Guid organizationId, Guid bomItemId, UpdateBomItemRequest request)
        {
            var bomItem = await _context.BomItems
                .Include(b => b.ComponentProduct)
                .FirstOrDefaultAsync(b =>
                    b.OrganizationId == organizationId &&
                    b.Id == bomItemId &&
                    b.DeletedAt == null);

            if (bomItem == null) return null;

            bomItem.Quantity = request.Quantity;
            bomItem.Notes = request.Notes;

            await _context.SaveChangesAsync();

            return new BomItemDto
            {
                Id = bomItem.Id,
                ComponentProductId = bomItem.ComponentProductId,
                ComponentProductCode = bomItem.ComponentProduct!.Code,
                ComponentProductName = bomItem.ComponentProduct.Name,
                ComponentProductUnit = bomItem.ComponentProduct.Unit,
                Quantity = bomItem.Quantity,
                Notes = bomItem.Notes,
                CreatedAt = bomItem.CreatedAt
            };
        }

        public async Task<bool> DeleteBomItemAsync(Guid organizationId, Guid bomItemId)
        {
            var bomItem = await _context.BomItems
                .FirstOrDefaultAsync(b =>
                    b.OrganizationId == organizationId &&
                    b.Id == bomItemId &&
                    b.DeletedAt == null);

            if (bomItem == null) return false;

            _context.BomItems.Remove(bomItem);
            await _context.SaveChangesAsync();
            return true;
        }

        // ── Stock Operations ──

        public IQueryable<StockMovementDto> GetStockMovementsQueryable(Guid organizationId, Guid productId)
        {
            return _context.StockMovements
                .Where(m => m.OrganizationId == organizationId && m.ProductId == productId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new StockMovementDto
                {
                    Id = m.Id,
                    ProductId = m.ProductId,
                    ProductCode = m.Product!.Code,
                    ProductName = m.Product.Name,
                    Quantity = m.Quantity,
                    UnitCost = m.UnitCost,
                    Currency = m.Currency,
                    TotalCost = m.TotalCost,
                    Type = m.Type,
                    SupplierId = m.SupplierId,
                    SupplierName = m.Supplier != null ? m.Supplier.Name : null,
                    WarehouseId = m.WarehouseId,
                    WarehouseName = m.Warehouse != null ? m.Warehouse.Name : null,
                    Destination = m.Destination,
                    Note = m.Note,
                    CreatedAt = m.CreatedAt,
                    CreatedByFullName = ""
                });
        }

        public async Task<List<StockMovementDto>> GetStockMovementsAsync(Guid organizationId, Guid productId)
        {
            return await GetStockMovementsQueryable(organizationId, productId).ToListAsync();
        }

        public async Task<StockMovementDto> StockInAsync(Guid organizationId, Guid userId, Guid productId, StockInRequest request)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == productId);

            if (product == null)
                throw new InvalidOperationException("Product not found.");

            var oldQuantity = product.StockQuantity;
            var oldAvgCost = product.AvgCost ?? 0;

            // Weighted average cost calculation
            if (request.UnitCost.HasValue)
            {
                var totalCost = (oldAvgCost * oldQuantity) + (request.UnitCost.Value * request.Quantity);
                product.StockQuantity += request.Quantity;
                product.AvgCost = product.StockQuantity > 0
                    ? Math.Round(totalCost / product.StockQuantity, 4)
                    : 0;
                product.LastPurchasePrice = request.UnitCost;
            }
            else
            {
                product.StockQuantity += request.Quantity;
            }

            product.UpdatedById = userId;

            var movement = new StockMovementEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                ProductId = productId,
                Quantity = request.Quantity,
                UnitCost = request.UnitCost,
                TotalCost = request.UnitCost.HasValue ? request.Quantity * request.UnitCost.Value : null,
                Currency = request.Currency,
                Type = "In",
                SupplierId = request.SupplierId,
                WarehouseId = request.WarehouseId,
                Note = request.Note,
                CreatedById = userId
            };

            _context.StockMovements.Add(movement);
            await _context.SaveChangesAsync();

            return (await GetStockMovementsQueryable(organizationId, productId)
                .FirstAsync(m => m.Id == movement.Id))!;
        }

        public async Task<StockMovementDto> StockOutAsync(Guid organizationId, Guid userId, Guid productId, StockOutRequest request)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == productId);

            if (product == null)
                throw new InvalidOperationException("Product not found.");

            if (product.StockQuantity < request.Quantity)
                throw new InvalidOperationException($"Insufficient stock. Available: {product.StockQuantity}");

            product.StockQuantity -= request.Quantity;
            product.UpdatedById = userId;

            var unitCost = product.AvgCost;

            var movement = new StockMovementEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                ProductId = productId,
                Quantity = request.Quantity,
                UnitCost = unitCost,
                TotalCost = unitCost.HasValue ? request.Quantity * unitCost.Value : null,
                Type = "Out",
                Destination = request.Destination,
                Note = request.Note,
                CreatedById = userId
            };

            _context.StockMovements.Add(movement);
            await _context.SaveChangesAsync();

            return (await GetStockMovementsQueryable(organizationId, productId)
                .FirstAsync(m => m.Id == movement.Id))!;
        }

        public async Task<StockMovementDto> StockAdjustAsync(Guid organizationId, Guid userId, Guid productId, StockAdjustRequest request)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Id == productId);

            if (product == null)
                throw new InvalidOperationException("Product not found.");

            var diff = request.NewQuantity - product.StockQuantity;

            product.StockQuantity = request.NewQuantity;
            if (request.NewAvgCost.HasValue)
            {
                product.AvgCost = request.NewAvgCost;
            }
            product.UpdatedById = userId;

            var movement = new StockMovementEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                ProductId = productId,
                Quantity = Math.Abs(diff),
                UnitCost = product.AvgCost,
                TotalCost = product.AvgCost.HasValue ? Math.Abs(diff) * product.AvgCost.Value : null,
                Type = "Adjustment",
                Note = request.Note,
                CreatedById = userId
            };

            _context.StockMovements.Add(movement);
            await _context.SaveChangesAsync();

            return (await GetStockMovementsQueryable(organizationId, productId)
                .FirstAsync(m => m.Id == movement.Id))!;
        }

        private async Task<bool> HasCircularReferenceAsync(Guid organizationId, Guid parentProductId, Guid componentProductId)
        {
            var allBomItems = await _context.BomItems
                .Where(b => b.OrganizationId == organizationId && b.DeletedAt == null)
                .ToListAsync();

            var ancestors = new HashSet<Guid>();
            var queue = new Queue<Guid>();
            queue.Enqueue(componentProductId);

            while (queue.Count > 0)
            {
                var current = queue.Dequeue();
                var parents = allBomItems
                    .Where(b => b.ComponentProductId == current)
                    .Select(b => b.ParentProductId);

                foreach (var parent in parents)
                {
                    if (parent == parentProductId)
                        return true;
                    if (ancestors.Add(parent))
                        queue.Enqueue(parent);
                }
            }

            return false;
        }
    }
}
