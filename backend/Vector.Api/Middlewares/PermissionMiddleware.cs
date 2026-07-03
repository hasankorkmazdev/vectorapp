using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Vector.Api.Attributes;
using Vector.Api.Data;
using Vector.Api.Entities;
using Vector.Api.Extensions;
using Vector.Api.Models.Common;

namespace Vector.Api.Middlewares
{
    public class PermissionMiddleware
    {
        private readonly RequestDelegate _next;

        public PermissionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext, IMemoryCache memoryCache)
        {
            // 1. Get endpoint
            var endpoint = context.GetEndpoint();
            if (endpoint == null)
            {
                await _next(context);
                return;
            }

            // 2. Check for [AllowAnonymous] bypass
            var allowAnonymous = endpoint.Metadata.GetMetadata<IAllowAnonymous>();
            if (allowAnonymous != null)
            {
                await _next(context);
                return;
            }

            // 3. Check for [PermissionScope] attribute
            var scopeAttr = endpoint.Metadata.GetMetadata<PermissionScopeAttribute>();
            if (scopeAttr == null)
            {
                await _next(context);
                return;
            }

            // 4. Authenticate - Get User ID
            var userId = context.GetUserId();

            // 5. Get X-Organization-Id header
            var organizationId = context.GetOrganizationId();

            // 6. Fetch from cache or DB
            var cacheKey = $"user-auth-{userId}-{organizationId}";

            if (!memoryCache.TryGetValue(cacheKey, out UserAuthCache? authCache) || authCache == null)
            {
                // Fetch organization specific roles and permissions
                var roles = await dbContext.OrganizationMembers
                    .Where(om => om.UserId == userId && om.OrganizationId == organizationId)
                    .Select(om => om.Role!.Name)
                    .ToListAsync();

                var permissions = await dbContext.OrganizationMembers
                    .Where(om => om.UserId == userId && om.OrganizationId == organizationId)
                    .Join(dbContext.RolePermissions,
                        om => om.RoleId,
                        rp => rp.RoleId,
                        (om, rp) => rp)
                    .Join(dbContext.Permissions,
                        rp => rp.PermissionId,
                        p => p.Id,
                        (rp, p) => p.Name)
                    .Distinct()
                    .ToListAsync();

                authCache = new UserAuthCache
                {
                    Roles = roles,
                    Permissions = permissions
                };

                // Cache for 30 minutes absolute, 5 minutes sliding expiration
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(5));

                memoryCache.Set(cacheKey, authCache, cacheOptions);
            }

            // 7. Verify permission scopes
            var hasPermission = authCache.Permissions.Contains("vector.all") || 
                                scopeAttr.Scopes.Any(requiredScope => authCache.Permissions.Contains(requiredScope));

            if (!hasPermission)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { message = "You do not have permission to perform this action." });
                return;
            }

            await _next(context);
        }
    }
}
