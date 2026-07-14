using System;

namespace Vector.Api.Models.Stock
{
    public class StockMovementDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal? UnitCost { get; set; }
        public decimal? TotalCost { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Source { get; set; }
        public string? Destination { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedByFullName { get; set; } = string.Empty;
    }
}
