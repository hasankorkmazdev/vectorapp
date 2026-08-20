using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using System;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Common;
using Vector.Api.Models.Maintenance;
using Vector.Api.Services.Maintenance;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EquipmentController : ControllerBase
    {
        private readonly IEquipmentService _equipmentService;

        public EquipmentController(IEquipmentService equipmentService)
        {
            _equipmentService = equipmentService;
        }

        [HttpGet]
        [RequiresOrganization]
        [PermissionScope("maintenance.view")]
        [EnableQuery(PageSize = 100)]
        public IQueryable<EquipmentListDto> GetAll()
        {
            var orgId = this.GetOrganizationId();
            return _equipmentService.GetQueryable(orgId);
        }

        [HttpGet("{id}")]
        [RequiresOrganization]
        [PermissionScope("maintenance.view")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var orgId = this.GetOrganizationId();
            var equipment = await _equipmentService.GetByIdAsync(orgId, id);
            if (equipment == null)
                return NotFound(Result.Failure("Equipment not found.", 404));
            return Ok(Result<EquipmentDto>.Success(equipment, "Equipment retrieved successfully."));
        }

        [HttpPost]
        [RequiresOrganization]
        [PermissionScope("maintenance.manage")]
        public async Task<IActionResult> Create([FromBody] CreateEquipmentRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var equipment = await _equipmentService.CreateAsync(orgId, userId, request);
            return Ok(Result<EquipmentDto>.Success(equipment, "Equipment created successfully.", 201));
        }

        [HttpPut("{id}")]
        [RequiresOrganization]
        [PermissionScope("maintenance.manage")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEquipmentRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var equipment = await _equipmentService.UpdateAsync(orgId, userId, id, request);
            if (equipment == null)
                return NotFound(Result.Failure("Equipment not found.", 404));
            return Ok(Result<EquipmentDto>.Success(equipment, "Equipment updated successfully."));
        }

        [HttpDelete("{id}")]
        [RequiresOrganization]
        [PermissionScope("maintenance.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var deleted = await _equipmentService.DeleteAsync(orgId, userId, id);
            if (!deleted)
                return NotFound(Result.Failure("Equipment not found.", 404));
            return Ok(Result.Success("Equipment deleted successfully."));
        }
    }
}
