using System;

namespace Vector.Api.Entities
{
    public class StockMovementEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid ProductId { get; set; }
        public decimal Quantity { get; set; }
        public decimal? UnitCost { get; set; }
        public decimal? TotalCost { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Source { get; set; }
        public string? Destination { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedById { get; set; }

        public ProductEntity? Product { get; set; }
    }
}
