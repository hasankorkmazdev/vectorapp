using System;

namespace Vector.Api.Entities
{
    public class RolePermissionEntity
    {
        public Guid RoleId { get; set; }
        public RoleEntity? Role { get; set; }
        public Guid PermissionId { get; set; }
        public PermissionEntity? Permission { get; set; }
    }
}
