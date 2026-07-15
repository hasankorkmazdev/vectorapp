using System;

namespace Vector.Api.Entities
{
    public class WarehouseEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Location { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? CreatedById { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? DeletedById { get; set; }
    }
}
