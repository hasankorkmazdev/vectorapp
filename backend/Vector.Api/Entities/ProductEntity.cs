using System;
using System.Collections.Generic;

namespace Vector.Api.Entities
{
    public class ProductEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal? SalePrice { get; set; }
        public string SellingCurrency { get; set; } = "TRY";
        public bool IsActive { get; set; } = true;
        public decimal StockQuantity { get; set; }
        public decimal? AvgCost { get; set; }
        public decimal? LastPurchasePrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? CreatedById { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? DeletedById { get; set; }
        public Guid? GroupId { get; set; }
        public string? ImageUrl { get; set; }

        public ProductGroupEntity? Group { get; set; }
        public List<BomItemEntity> ParentBomItems { get; set; } = new();
        public List<BomItemEntity> ComponentBomItems { get; set; } = new();
        public List<StockMovementEntity> StockMovements { get; set; } = new();
    }
}
