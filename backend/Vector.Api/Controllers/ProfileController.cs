using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vector.Api.Models.Profile;
using Vector.Api.Models.Organization;
using Vector.Api.Services.Auth;
using System;
using System.Linq;
using Vector.Api.Entities;
using System.Security.Claims;
using System.Threading.Tasks;
using Vector.Api.Extensions;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly IUserService _userService;

        public ProfileController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var user = await this.GetCurrentUserAsync();

            return Ok(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                roles = new List<RoleModel>(),
                permissions = new List<string>(),
                phoneNumber = user.PhoneNumber,
                isPhoneVerified = user.IsPhoneVerified,
                organizations = user.OrganizationMembers.Select(om => new
                {
                    id = om.OrganizationId,
                    name = om.Organization?.Name ?? string.Empty,
                    role = om.Role?.Name ?? string.Empty,
                    isSetupRequired = om.Organization?.IsSetupRequired ?? false
                }).ToList()
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = this.GetUserId();

            try
            {
                var updatedUser = await _userService.UpdateProfileAsync(userId, request);
                return Ok(new
                {
                    message = "Profile updated successfully.",
                    user = new
                    {
                        id = updatedUser.Id,
                        fullName = updatedUser.FullName
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify-phone/send")]
        public async Task<IActionResult> SendPhoneVerificationSms([FromBody] SendPhoneVerificationRequest request)
        {
            if (string.IsNullOrEmpty(request.CountryCode) || string.IsNullOrEmpty(request.PhoneNumber))
            {
                return BadRequest(new { message = "Country code and Phone number are required." });
            }

            var userId = this.GetUserId();

            try
            {
                var result = await _userService.RequestPhoneVerificationSmsAsync(userId, request.CountryCode, request.PhoneNumber);
                if (!result)
                {
                    return BadRequest(new { message = "Failed to send verification SMS." });
                }
                return Ok(new { message = "Verification SMS sent successfully. Please check your messages (or console logs)." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify-phone/confirm")]
        public async Task<IActionResult> ConfirmPhone([FromBody] ConfirmPhoneRequest request)
        {
            if (string.IsNullOrEmpty(request.Code))
            {
                return BadRequest(new { message = "Verification code is required." });
            }

            var userId = this.GetUserId();

            var result = await _userService.VerifyPhoneAsync(userId, request.Code);
            if (!result)
            {
                return BadRequest(new { message = "Invalid code. Phone verification failed." });
            }

            return Ok(new { message = "Phone number verified successfully." });
        }

    }
}
