using System;
using System.Collections.Generic;

namespace Vector.Api.Models.Product
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal? SalePrice { get; set; }
        public string SellingCurrency { get; set; } = "TRY";
        public bool IsActive { get; set; }
        public decimal StockQuantity { get; set; }
        public decimal? AvgCost { get; set; }
        public decimal? LastPurchasePrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? GroupId { get; set; }
        public string? GroupName { get; set; }
        public string? ImageUrl { get; set; }
        public List<BomItemDto> BomItems { get; set; } = new();
    }
}
