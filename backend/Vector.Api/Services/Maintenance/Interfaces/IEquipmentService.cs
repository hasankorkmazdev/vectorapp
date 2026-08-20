using System;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.Maintenance;

namespace Vector.Api.Services.Maintenance
{
    public interface IEquipmentService
    {
        IQueryable<EquipmentListDto> GetQueryable(Guid organizationId);
        Task<EquipmentDto?> GetByIdAsync(Guid organizationId, Guid id);
        Task<EquipmentDto> CreateAsync(Guid organizationId, Guid userId, CreateEquipmentRequest request);
        Task<EquipmentDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateEquipmentRequest request);
        Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id);
    }
}
