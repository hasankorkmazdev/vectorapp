using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Data;
using Vector.Api.Models.Common;

namespace Vector.Api.Services.Auth
{
    public class CurrentUserPermissionService : ICurrentUserPermissionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _memoryCache;

        public CurrentUserPermissionService(ApplicationDbContext context, IMemoryCache memoryCache)
        {
            _context = context;
            _memoryCache = memoryCache;
        }

        public async Task<bool> HasPermissionAsync(Guid organizationId, Guid userId, string scope)
        {
            var cacheKey = $"user-auth-{userId}-{organizationId}";

            if (!_memoryCache.TryGetValue(cacheKey, out UserAuthCache? authCache) || authCache == null)
            {
                var roles = await _context.OrganizationMembers
                    .Where(om => om.UserId == userId && om.OrganizationId == organizationId)
                    .Select(om => om.Role!.Name)
                    .ToListAsync();

                var permissions = await _context.OrganizationMembers
                    .Where(om => om.UserId == userId && om.OrganizationId == organizationId)
                    .Join(_context.RolePermissions,
                        om => om.RoleId,
                        rp => rp.RoleId,
                        (om, rp) => rp)
                    .Join(_context.Permissions,
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

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(5));

                _memoryCache.Set(cacheKey, authCache, cacheOptions);
            }

            return authCache.Permissions.Contains("super.admin") || authCache.Permissions.Contains(scope);
        }
    }
}
