using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Models.Auth;
using Vector.Api.Models.Organization;
using Vector.Api.Services.Auth;
using Vector.Api.Services.Infrastructure;
using Vector.Api.Entities;
using System;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        private readonly ICaptchaService _captchaService;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly IHostEnvironment _env;

        public AuthController(
            IUserService userService,
            ITokenService tokenService,
            ICaptchaService captchaService,
            IConfiguration configuration,
            ApplicationDbContext context,
            IHostEnvironment env)
        {
            _userService = userService;
            _tokenService = tokenService;
            _captchaService = captchaService;
            _configuration = configuration;
            _context = context;
            _env = env;
        }

        private CookieOptions GetRefreshTokenCookieOptions() => new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),
            SameSite = _env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        [HttpPost("register")]
        [EnableRateLimiting("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!await _captchaService.VerifyAsync(request.CaptchaToken))
                return BadRequest(new { message = "CAPTCHA verification failed." });

            try
            {
                var user = await _userService.RegisterAsync(request);
                return Ok(new { message = "Registration successful. Please check your email to verify your account." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        [EnableRateLimiting("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!await _captchaService.VerifyAsync(request.CaptchaToken))
                return BadRequest(new { message = "CAPTCHA verification failed." });

            var (user, errorMessage) = await _userService.LoginAsync(request);
            if (user == null)
            {
                return Unauthorized(new { message = errorMessage });
            }

            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshTokenValue = await _tokenService.SaveRefreshTokenAsync(user, _context);

            Response.Cookies.Append("refreshToken", refreshTokenValue, GetRefreshTokenCookieOptions());

            return Ok(new
            {
                token = accessToken,
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    roles = new List<RoleModel>(),
                    permissions = new List<string>(),
                    isPhoneVerified = user.IsPhoneVerified,
                    organizations = user.OrganizationMembers.Select(om => new
                    {
                        id = om.OrganizationId,
                        name = om.Organization?.Name ?? string.Empty,
                        role = om.Role?.Name ?? string.Empty,
                        isSetupRequired = om.Organization?.IsSetupRequired ?? false
                    }).ToList()
                }
            });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            var (user, errorMessage, email, fullName) = await _userService.LoginWithGoogleAsync(request);
            if (user == null)
            {
                if (errorMessage == "USER_NOT_FOUND")
                {
                    return Ok(new { exists = false, email, fullName });
                }
                return BadRequest(new { message = errorMessage });
            }

            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshTokenValue = await _tokenService.SaveRefreshTokenAsync(user, _context);

            Response.Cookies.Append("refreshToken", refreshTokenValue, GetRefreshTokenCookieOptions());

            return Ok(new
            {
                exists = true,
                token = accessToken,
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    roles = new List<RoleModel>(),
                    permissions = new List<string>(),
                    isPhoneVerified = user.IsPhoneVerified,
                    organizations = user.OrganizationMembers.Select(om => new
                    {
                        id = om.OrganizationId,
                        name = om.Organization?.Name ?? string.Empty,
                        role = om.Role?.Name ?? string.Empty,
                        isSetupRequired = om.Organization?.IsSetupRequired ?? false
                    }).ToList()
                }
            });
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
        {
            var result = await _userService.VerifyEmailAsync(email, token);
            if (!result)
            {
                return BadRequest(new { message = "Invalid email or verification token, or link has expired." });
            }

            // Return success JSON for frontend to handle
            return Ok(new { message = "Email verified successfully." });
        }

        [HttpPost("forgot-password")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (!await _captchaService.VerifyAsync(request.CaptchaToken))
                return BadRequest(new { message = "CAPTCHA verification failed." });

            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            var result = await _userService.RequestPasswordResetAsync(request.Email);
            // We return 200 Ok in both cases to prevent user enumeration attacks
            return Ok(new { message = "If the email exists, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _userService.ResetPasswordAsync(request);
            if (!result)
            {
                return BadRequest(new { message = "Invalid email or reset token, or token has expired." });
            }

            return Ok(new { message = "Password reset successfully. You can now login with your new password." });
        }

        [HttpPost("resend-verification")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request)
        {
            if (!await _captchaService.VerifyAsync(request.CaptchaToken))
                return BadRequest(new { message = "CAPTCHA verification failed." });

            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            await _userService.ResendVerificationEmailAsync(request.Email);
            return Ok(new { message = "If your email is registered and unverified, a new verification link has been sent." });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshTokenValue = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshTokenValue))
            {
                var token = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == refreshTokenValue);
                if (token != null && token.RevokedAt == null)
                {
                    token.RevokedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshTokenValue = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshTokenValue))
                return Unauthorized(new { message = "No refresh token provided." });

            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                    .ThenInclude(u => u.OrganizationMembers)
                        .ThenInclude(om => om.Organization)
                .Include(rt => rt.User)
                    .ThenInclude(u => u.OrganizationMembers)
                        .ThenInclude(om => om.Role)
                .FirstOrDefaultAsync(rt => rt.Token == refreshTokenValue);

            if (storedToken == null)
                return Unauthorized(new { message = "Invalid refresh token." });

            if (storedToken.RevokedAt != null)
                return Unauthorized(new { message = "Refresh token has been revoked." });

            if (DateTime.UtcNow >= storedToken.ExpiresAt)
                return Unauthorized(new { message = "Refresh token has expired." });

            var user = storedToken.User;

            // Revoke old token and issue new one
            storedToken.RevokedAt = DateTime.UtcNow;

            var newRefreshTokenValue = await _tokenService.SaveRefreshTokenAsync(user, _context);
            var newAccessToken = _tokenService.GenerateAccessToken(user);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", newRefreshTokenValue, cookieOptions);

            return Ok(new
            {
                token = newAccessToken,
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    roles = new List<RoleModel>(),
                    permissions = new List<string>(),
                    isPhoneVerified = user.IsPhoneVerified,
                    organizations = user.OrganizationMembers.Select(om => new
                    {
                        id = om.OrganizationId,
                        name = om.Organization?.Name ?? string.Empty,
                        role = om.Role?.Name ?? string.Empty,
                        isSetupRequired = om.Organization?.IsSetupRequired ?? false
                    }).ToList()
                }
            });
        }
    }
}
