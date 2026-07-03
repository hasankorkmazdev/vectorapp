using System;
using System.Collections.Generic;

namespace Vector.Api.Entities
{
    public class PermissionEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<RolePermissionEntity> RolePermissions { get; set; } = new List<RolePermissionEntity>();
    }
}
