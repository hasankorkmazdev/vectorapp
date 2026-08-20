using System;
using System.Threading.Tasks;

namespace Vector.Api.Services.Auth
{
    public interface ICurrentUserPermissionService
    {
        Task<bool> HasPermissionAsync(Guid organizationId, Guid userId, string scope);
    }
}
