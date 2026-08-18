using System;

namespace Vector.Api.Entities.Auth
{
    public class RolePermissionEntity
    {
        public Guid RoleId { get; set; }
        public RoleEntity? Role { get; set; }
        public Guid PermissionId { get; set; }
        public PermissionEntity? Permission { get; set; }
    }
}
