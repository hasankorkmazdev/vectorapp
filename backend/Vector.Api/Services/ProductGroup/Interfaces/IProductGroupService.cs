using System;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.ProductGroup;

namespace Vector.Api.Services.ProductGroup
{
    public interface IProductGroupService
    {
        IQueryable<ProductGroupDto> GetQueryable(Guid organizationId);
        Task<ProductGroupDto> CreateAsync(Guid organizationId, Guid userId, CreateProductGroupRequest request);
        Task<bool> DeleteAsync(Guid organizationId, Guid id);
    }
}
