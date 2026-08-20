using System;
using Vector.Api.Entities.Inventory;
using Vector.Api.Entities.Product;

namespace Vector.Api.Entities.Maintenance
{
    public class MaintenanceWorkOrderItemEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid WorkOrderId { get; set; }
        public MaintenanceWorkOrderItemType Type { get; set; }
        public Guid? ProductId { get; set; }
        public string? Description { get; set; }
        public decimal Quantity { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Currency { get; set; }
        public decimal? TotalCost { get; set; }
        public Guid? StockMovementId { get; set; }
        public DateTime? RemovedAt { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedById { get; set; }

        public MaintenanceWorkOrderEntity? WorkOrder { get; set; }
        public ProductEntity? Product { get; set; }
        public StockMovementEntity? StockMovement { get; set; }
    }
}
