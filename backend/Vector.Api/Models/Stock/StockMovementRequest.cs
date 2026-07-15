using FluentValidation;

namespace Vector.Api.Models.Stock
{
    public class StockInRequest
    {
        public decimal Quantity { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Currency { get; set; }
        public Guid? SupplierId { get; set; }
        public Guid? WarehouseId { get; set; }
        public string? Note { get; set; }
    }

    public class StockInRequestValidator : AbstractValidator<StockInRequest>
    {
        public StockInRequestValidator()
        {
            RuleFor(x => x.Quantity).GreaterThan(0);
            RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0).When(x => x.UnitCost.HasValue);
            RuleFor(x => x.Note).MaximumLength(500).When(x => x.Note != null);
        }
    }

    public class StockOutRequest
    {
        public decimal Quantity { get; set; }
        public string? Destination { get; set; }
        public string? Note { get; set; }
    }

    public class StockOutRequestValidator : AbstractValidator<StockOutRequest>
    {
        public StockOutRequestValidator()
        {
            RuleFor(x => x.Quantity).GreaterThan(0);
            RuleFor(x => x.Destination).MaximumLength(200).When(x => x.Destination != null);
            RuleFor(x => x.Note).MaximumLength(500).When(x => x.Note != null);
        }
    }

    public class StockAdjustRequest
    {
        public decimal NewQuantity { get; set; }
        public decimal? NewAvgCost { get; set; }
        public string? Note { get; set; }
    }

    public class StockAdjustRequestValidator : AbstractValidator<StockAdjustRequest>
    {
        public StockAdjustRequestValidator()
        {
            RuleFor(x => x.NewQuantity).GreaterThanOrEqualTo(0);
            RuleFor(x => x.NewAvgCost).GreaterThanOrEqualTo(0).When(x => x.NewAvgCost.HasValue);
            RuleFor(x => x.Note).MaximumLength(500).When(x => x.Note != null);
        }
    }
}
