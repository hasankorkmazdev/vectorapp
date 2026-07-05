using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Common;
using Vector.Api.Models.Product;
using Vector.Api.Services.Product;
using System;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        [RequiresOrganization]
        [EnableQuery(PageSize = 100)]
        public IQueryable<ProductListDto> GetAll()
        {
            var orgId = this.GetOrganizationId();
            return _productService.GetQueryable(orgId);
        }

        [HttpGet("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> GetById(Guid id)
        {
            var orgId = this.GetOrganizationId();
            var product = await _productService.GetByIdAsync(orgId, id);
            if (product == null)
                return NotFound(Result.Failure("Product not found.", 404));
            return Ok(Result<ProductDto>.Success(product, "Product retrieved successfully."));
        }

        [HttpPost]
        [RequiresOrganization]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var product = await _productService.CreateAsync(orgId, userId, request);
            return Ok(Result<ProductDto>.Success(product, "Product created successfully.", 201));
        }

        [HttpPut("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var product = await _productService.UpdateAsync(orgId, userId, id, request);
            if (product == null)
                return NotFound(Result.Failure("Product not found.", 404));
            return Ok(Result<ProductDto>.Success(product, "Product updated successfully."));
        }

        [HttpDelete("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var deleted = await _productService.DeleteAsync(orgId, userId, id);
            if (!deleted)
                return NotFound(Result.Failure("Product not found.", 404));
            return Ok(Result.Success("Product deleted successfully."));
        }

        [HttpGet("{productId}/bom-tree")]
        [RequiresOrganization]
        public async Task<IActionResult> GetBomTree(Guid productId)
        {
            var orgId = this.GetOrganizationId();
            var tree = await _productService.GetBomTreeAsync(orgId, productId);
            return Ok(Result<BomTreeDto>.Success(tree, "BOM tree retrieved successfully."));
        }

        [HttpPost("{productId}/bom")]
        [RequiresOrganization]
        public async Task<IActionResult> CreateBomItem(Guid productId, [FromBody] CreateBomItemRequest request)
        {
            var orgId = this.GetOrganizationId();
            var bomItem = await _productService.CreateBomItemAsync(orgId, productId, request);
            if (bomItem == null)
                return BadRequest(Result.Failure("Product or component not found, or circular reference detected.", 400));
            return Ok(Result<BomItemDto>.Success(bomItem, "BOM item created successfully.", 201));
        }

        [HttpPut("bom/{bomItemId}")]
        [RequiresOrganization]
        public async Task<IActionResult> UpdateBomItem(Guid bomItemId, [FromBody] UpdateBomItemRequest request)
        {
            var orgId = this.GetOrganizationId();
            var bomItem = await _productService.UpdateBomItemAsync(orgId, bomItemId, request);
            if (bomItem == null)
                return NotFound(Result.Failure("BOM item not found.", 404));
            return Ok(Result<BomItemDto>.Success(bomItem, "BOM item updated successfully."));
        }

        [HttpDelete("bom/{bomItemId}")]
        [RequiresOrganization]
        public async Task<IActionResult> DeleteBomItem(Guid bomItemId)
        {
            var orgId = this.GetOrganizationId();
            var deleted = await _productService.DeleteBomItemAsync(orgId, bomItemId);
            if (!deleted)
                return NotFound(Result.Failure("BOM item not found.", 404));
            return Ok(Result.Success("BOM item deleted successfully."));
        }
    }
}
