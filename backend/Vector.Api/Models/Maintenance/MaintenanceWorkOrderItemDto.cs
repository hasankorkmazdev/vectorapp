using System;
using Vector.Api.Entities.Maintenance;

namespace Vector.Api.Models.Maintenance
{
    public class MaintenanceWorkOrderItemDto
    {
        public Guid Id { get; set; }
        public MaintenanceWorkOrderItemType Type { get; set; }
        public Guid? ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? Description { get; set; }
        public decimal Quantity { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Currency { get; set; }
        public decimal? TotalCost { get; set; }
        public DateTime? RemovedAt { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedById { get; set; }
    }
}
