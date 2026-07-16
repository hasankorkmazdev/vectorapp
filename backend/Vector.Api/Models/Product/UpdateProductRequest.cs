using FluentValidation;

namespace Vector.Api.Models.Product
{
    public class UpdateProductRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal? SalePrice { get; set; }
        public string SellingCurrency { get; set; } = "TRY";
        public bool IsActive { get; set; } = true;
        public Guid? GroupId { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
    {
        public UpdateProductRequestValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Unit).NotEmpty().MaximumLength(20);
            RuleFor(x => x.SalePrice).GreaterThanOrEqualTo(0).When(x => x.SalePrice.HasValue);
            RuleFor(x => x.SellingCurrency).NotEmpty().MaximumLength(10);
            RuleFor(x => x.Description).MaximumLength(1000);
            RuleFor(x => x.ImageUrl).MaximumLength(500);
        }
    }
}
