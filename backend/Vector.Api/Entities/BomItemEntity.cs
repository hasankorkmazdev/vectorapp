using System;

namespace Vector.Api.Entities
{
    public class BomItemEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid ParentProductId { get; set; }
        public Guid ComponentProductId { get; set; }
        public decimal Quantity { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        public ProductEntity? ParentProduct { get; set; }
        public ProductEntity? ComponentProduct { get; set; }
    }
}
