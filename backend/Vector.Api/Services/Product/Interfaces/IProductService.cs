using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.Product;
using Vector.Api.Models.Stock;

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

        // Stock operations
        IQueryable<StockMovementDto> GetStockMovementsQueryable(Guid organizationId, Guid productId);
        Task<List<StockMovementDto>> GetStockMovementsAsync(Guid organizationId, Guid productId);
        Task<StockMovementDto> StockInAsync(Guid organizationId, Guid userId, Guid productId, StockInRequest request);
        Task<StockMovementDto> StockOutAsync(Guid organizationId, Guid userId, Guid productId, StockOutRequest request);
        Task<StockMovementDto> StockAdjustAsync(Guid organizationId, Guid userId, Guid productId, StockAdjustRequest request);
    }
}
