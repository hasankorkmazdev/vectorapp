using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Common;
using Vector.Api.Models.Supplier;
using Vector.Api.Services.Supplier;
using System;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService _supplierService;

        public SupplierController(ISupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        [HttpGet]
        [RequiresOrganization]
        [EnableQuery(PageSize = 100)]
        public IQueryable<SupplierListDto> GetAll()
        {
            var orgId = this.GetOrganizationId();
            return _supplierService.GetQueryable(orgId);
        }

        [HttpPost]
        [RequiresOrganization]
        public async Task<IActionResult> Create([FromBody] CreateSupplierRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var supplier = await _supplierService.CreateAsync(orgId, userId, request);
            return Ok(Result<SupplierListDto>.Success(supplier, "Supplier created successfully.", 201));
        }

        [HttpPut("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplierRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var supplier = await _supplierService.UpdateAsync(orgId, userId, id, request);
            if (supplier == null)
                return NotFound(Result.Failure("Supplier not found.", 404));
            return Ok(Result<SupplierListDto>.Success(supplier, "Supplier updated successfully."));
        }

        [HttpDelete("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var deleted = await _supplierService.DeleteAsync(orgId, userId, id);
            if (!deleted)
                return NotFound(Result.Failure("Supplier not found.", 404));
            return Ok(Result.Success("Supplier deleted successfully."));
        }
    }
}
