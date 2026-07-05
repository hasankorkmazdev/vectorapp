using System;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.Product;

namespace Vector.Api.Services.Product
{
    public interface IProductService
    {
        IQueryable<ProductListDto> GetQueryable(Guid organizationId);
        Task<ProductDto?> GetByIdAsync(Guid organizationId, Guid id);
        Task<ProductDto> CreateAsync(Guid organizationId, Guid userId, CreateProductRequest request);
        Task<ProductDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateProductRequest request);
        Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id);

        Task<BomTreeDto> GetBomTreeAsync(Guid organizationId, Guid productId);
        Task<BomItemDto?> CreateBomItemAsync(Guid organizationId, Guid productId, CreateBomItemRequest request);
        Task<BomItemDto?> UpdateBomItemAsync(Guid organizationId, Guid bomItemId, UpdateBomItemRequest request);
        Task<bool> DeleteBomItemAsync(Guid organizationId, Guid bomItemId);
    }
}
