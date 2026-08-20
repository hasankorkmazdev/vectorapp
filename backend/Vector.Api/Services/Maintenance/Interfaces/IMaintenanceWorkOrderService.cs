using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.Common;
using Vector.Api.Models.Maintenance;

namespace Vector.Api.Services.Maintenance
{
    public interface IMaintenanceWorkOrderService
    {
        Task<List<MechanicOptionDto>> GetMechanicsAsync(Guid organizationId);
        Task<IQueryable<MaintenanceWorkOrderListDto>> GetQueryableAsync(Guid organizationId, Guid userId);
        Task<MaintenanceWorkOrderDto?> GetByIdAsync(Guid organizationId, Guid userId, Guid id);
        Task<Result<MaintenanceWorkOrderDto>> CreateAsync(Guid organizationId, Guid userId, CreateMaintenanceWorkOrderRequest request);
        Task<Result<MaintenanceWorkOrderDto>> AssignAsync(Guid organizationId, Guid userId, Guid workOrderId, AssignWorkOrderRequest request);
        Task<Result<MaintenanceWorkOrderDto>> ChangeStatusAsync(Guid organizationId, Guid userId, Guid workOrderId, ChangeWorkOrderStatusRequest request);
        Task<Result<MaintenanceWorkOrderItemDto>> AddItemAsync(Guid organizationId, Guid userId, Guid workOrderId, AddWorkOrderItemRequest request);
        Task<Result<bool>> RemoveItemAsync(Guid organizationId, Guid userId, Guid workOrderId, Guid itemId);
        Task<Result<MaintenanceNoteDto>> AddNoteAsync(Guid organizationId, Guid userId, Guid workOrderId, AddMaintenanceNoteRequest request);
    }
}
