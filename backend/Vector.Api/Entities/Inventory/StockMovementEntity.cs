using System;
using Vector.Api.Entities.Customer;
using Vector.Api.Entities.Product;
using Vector.Api.Entities.Supplier;

namespace Vector.Api.Entities.Inventory
{
    public class StockMovementEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid ProductId { get; set; }
        public decimal Quantity { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Currency { get; set; }
        public decimal? TotalCost { get; set; }
        public StockMovementType Type { get; set; }
        public Guid? SupplierId { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? WarehouseId { get; set; }
        public string? Destination { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedById { get; set; }

        public ProductEntity? Product { get; set; }
        public SupplierEntity? Supplier { get; set; }
        public CustomerEntity? Customer { get; set; }
        public WarehouseEntity? Warehouse { get; set; }
    }
}
