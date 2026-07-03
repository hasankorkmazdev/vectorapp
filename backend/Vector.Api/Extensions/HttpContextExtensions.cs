using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Vector.Api.Entities;
using Vector.Api.Services.Auth;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Vector.Api.Extensions
{
    public static class HttpContextExtensions
    {
        public static Guid GetUserId(this HttpContext context)
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        public static Guid GetOrganizationId(this HttpContext context)
        {
            if (context.Request.Headers.TryGetValue("X-Organization-Id", out var organizationIdStr) && 
                Guid.TryParse(organizationIdStr, out var organizationId))
            {
                return organizationId;
            }
            throw new BadHttpRequestException("X-Organization-Id header is missing or invalid.", 400);
        }

        public static async Task<UserEntity> GetCurrentUserAsync(this HttpContext context)
        {
            var userId = context.GetUserId();
            var userService = context.RequestServices.GetRequiredService<IUserService>();
            var user = await userService.GetByIdAsync(userId);
            if (user == null)
            {
                throw new BadHttpRequestException("User profile not found.", 404);
            }
            return user;
        }
    }
}
