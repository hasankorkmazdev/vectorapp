using System;
using Vector.Api.Entities.Account;
using Vector.Api.Entities.Product;

namespace Vector.Api.Entities.Maintenance
{
    public class EquipmentEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid AccountId { get; set; }
        public Guid? ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Manufacturer { get; set; }
        public string? Model { get; set; }
        public string? SerialNumber { get; set; }
        public string? Note { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? CreatedById { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? DeletedById { get; set; }

        public AccountEntity? Account { get; set; }
        public ProductEntity? Product { get; set; }
    }
}
