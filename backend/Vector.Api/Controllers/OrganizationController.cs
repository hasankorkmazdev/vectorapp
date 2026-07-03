using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Organization;
using Vector.Api.Models.Common;
using Vector.Api.Services.Organization;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganizationService _orgService;

        public OrganizationController(IOrganizationService orgService)
        {
            _orgService = orgService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationRequest request)
        {
            var user = await this.GetCurrentUserAsync();
            var org = await _orgService.CreateAsync(user, request);
            return Ok(Result.Success("Organization created successfully.", 200, new { organizationId = org.Id, organizationName = org.Name }));
        }

        [HttpPost("setup")]
        [RequiresOrganization]
        public async Task<IActionResult> CompleteSetup([FromBody] CompleteSetupRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var (success, error) = await _orgService.CompleteSetupAsync(userId, orgId, request);
            if (!success) return error == "Organization not found." ? NotFound(Result.Failure(error!, 404)) : BadRequest(Result.Failure(error!, error!.Contains("not a member") ? 403 : 400));
            return Ok(Result.Success("Organization setup completed successfully."));
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrganizations()
        {
            var userId = this.GetUserId();
            var orgs = await _orgService.GetUserOrganizationsAsync(userId);
            return Ok(Result<System.Collections.Generic.List<OrganizationDto>>.Success(orgs, "User organizations retrieved successfully."));
        }

        [HttpGet]
        [RequiresOrganization]
        public async Task<IActionResult> GetOrganizationDetails()
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var (result, error) = await _orgService.GetDetailsAsync(userId, orgId);
            if (result == null) return error!.Contains("not a member") ? StatusCode(403, Result.Failure(error, 403)) : NotFound(Result.Failure(error!, 404));
            return Ok(Result<OrganizationDetailsResponse>.Success(result, "Organization details retrieved successfully."));
        }

        [HttpGet("settings")]
        [RequiresOrganization]
        public async Task<IActionResult> GetSettings()
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var (result, error) = await _orgService.GetSettingsAsync(userId, orgId);
            if (result == null) return error!.Contains("not a member") ? StatusCode(403, Result.Failure(error, 403)) : NotFound(Result.Failure(error!, 404));
            return Ok(Result<OrganizationSettingsDto>.Success(result, "Organization settings retrieved successfully."));
        }

        [HttpPut("settings")]
        [RequiresOrganization]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateOrganizationSettingsRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var (success, error) = await _orgService.UpdateSettingsAsync(userId, orgId, request);
            if (!success)
            {
                if (error!.Contains("not a member") || error.Contains("Only owners")) return StatusCode(403, Result.Failure(error, 403));
                return NotFound(Result.Failure(error, 404));
            }
            return Ok(Result.Success("Organization settings updated successfully."));
        }
    }
}
