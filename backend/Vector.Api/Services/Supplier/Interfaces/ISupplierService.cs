using System;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.Supplier;

namespace Vector.Api.Services.Supplier
{
    public interface ISupplierService
    {
        IQueryable<SupplierListDto> GetQueryable(Guid organizationId);
        Task<SupplierListDto> CreateAsync(Guid organizationId, Guid userId, CreateSupplierRequest request);
        Task<SupplierListDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateSupplierRequest request);
        Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id);
    }
}
