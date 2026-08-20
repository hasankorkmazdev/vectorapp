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
    public class MaintenanceWorkOrderController : ControllerBase
    {
        private readonly IMaintenanceWorkOrderService _workOrderService;

        public MaintenanceWorkOrderController(IMaintenanceWorkOrderService workOrderService)
        {
            _workOrderService = workOrderService;
        }

        [HttpGet("mechanics")]
        [RequiresOrganization]
        [PermissionScope("maintenance.view", "maintenance.manage")]
        public async Task<IActionResult> GetMechanics()
        {
            var orgId = this.GetOrganizationId();
            var mechanics = await _workOrderService.GetMechanicsAsync(orgId);
            return Ok(Result<System.Collections.Generic.List<MechanicOptionDto>>.Success(mechanics, "Mechanics retrieved successfully."));
        }

        [HttpGet]
        [RequiresOrganization]
        [PermissionScope("maintenance.view")]
        [EnableQuery(PageSize = 100)]
        public async Task<IQueryable<MaintenanceWorkOrderListDto>> GetAll()
        {
            var orgId = this.GetOrganizationId();
            var userId = this.GetUserId();
            return await _workOrderService.GetQueryableAsync(orgId, userId);
        }

        [HttpGet("{id}")]
        [RequiresOrganization]
        [PermissionScope("maintenance.view")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var orgId = this.GetOrganizationId();
            var userId = this.GetUserId();
            var workOrder = await _workOrderService.GetByIdAsync(orgId, userId, id);
            if (workOrder == null)
                return NotFound(Result.Failure("Work order not found.", 404));
            return Ok(Result<MaintenanceWorkOrderDto>.Success(workOrder, "Work order retrieved successfully."));
        }

        [HttpPost]
        [RequiresOrganization]
        [PermissionScope("maintenance.manage")]
        public async Task<IActionResult> Create([FromBody] CreateMaintenanceWorkOrderRequest request)
        {
            var orgId = this.GetOrganizationId();
            var userId = this.GetUserId();
            var result = await _workOrderService.CreateAsync(orgId, userId, request);
            if (result.Error)
                return StatusCode(result.Code, result);
            return Ok(result);
        }

        [HttpPut("{id}/assign")]
        [RequiresOrganization]
        [PermissionScope("maintenance.manage")]
        public async Task<IActionResult> Assign(Guid id, [FromBody] AssignWorkOrderRequest request)
        {
            var orgId = this.GetOrganizationId();
            var userId = this.GetUserId();
            var result = await _workOrderService.AssignAsync(orgId, userId, id, request);
            if (result.Error)
                return StatusCode(result.Code, result);
            return Ok(result);
        }

        [HttpPut("{id}/status")]
        [RequiresOrganization]
        [PermissionScope("maintenance.manage")]
        public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeWorkOrderStatusRequest request)
        {
            var orgId = this.GetOrganizationId();
            var userId = this.GetUserId();
            var result = await _workOrderService.ChangeStatusAsync(orgId, userId, id, request);
            if (result.Error)
                return StatusCode(result.Code, result);
            return Ok(result);
        }

        [HttpPost("{id}/items")]
        [RequiresOrganization]
        [PermissionScope("maintenance.manage")]
        public async Task<IActionResult> AddItem(Guid id, [FromBody] AddWorkOrderItemRequest request)
        {
            var orgId = this.GetOrganizationId();
            var userId = this.GetUserId();
            var result = await _workOrderService.AddItemAsync(orgId, userId, id, request);
            if (result.Error)
                return StatusCode(result.Code, result);
            return Ok(result);
        }

        [HttpDelete("{id}/items/{itemId}")]
        [RequiresOrganization]
        [PermissionScope("maintenance.manage")]
        public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
        {
            var orgId = this.GetOrganizationId();
            var userId = this.GetUserId();
            var result = await _workOrderService.RemoveItemAsync(orgId, userId, id, itemId);
            if (result.Error)
                return StatusCode(result.Code, result);
            return Ok(result);
        }

        [HttpPost("{id}/notes")]
        [RequiresOrganization]
        [PermissionScope("maintenance.view")]
        public async Task<IActionResult> AddNote(Guid id, [FromBody] AddMaintenanceNoteRequest request)
        {
            var orgId = this.GetOrganizationId();
            var userId = this.GetUserId();
            var result = await _workOrderService.AddNoteAsync(orgId, userId, id, request);
            if (result.Error)
                return StatusCode(result.Code, result);
            return Ok(result);
        }
    }
}
