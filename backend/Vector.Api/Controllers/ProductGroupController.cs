using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Common;
using Vector.Api.Models.ProductGroup;
using Vector.Api.Services.ProductGroup;
using System;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductGroupController : ControllerBase
    {
        private readonly IProductGroupService _productGroupService;

        public ProductGroupController(IProductGroupService productGroupService)
        {
            _productGroupService = productGroupService;
        }

        [HttpGet]
        [RequiresOrganization]
        [EnableQuery(PageSize = 100)]
        public IQueryable<ProductGroupDto> GetAll()
        {
            var orgId = this.GetOrganizationId();
            return _productGroupService.GetQueryable(orgId);
        }

        [HttpPost]
        [RequiresOrganization]
        public async Task<IActionResult> Create([FromBody] CreateProductGroupRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var group = await _productGroupService.CreateAsync(orgId, userId, request);
            return Ok(Result<ProductGroupDto>.Success(group, "Product group created successfully.", 201));
        }

        [HttpDelete("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Delete(Guid id)
        {
            var orgId = this.GetOrganizationId();
            var deleted = await _productGroupService.DeleteAsync(orgId, id);
            if (!deleted)
                return NotFound(Result.Failure("Product group not found.", 404));
            return Ok(Result.Success("Product group deleted successfully."));
        }
    }
}
