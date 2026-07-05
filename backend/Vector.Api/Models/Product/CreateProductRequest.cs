using FluentValidation;

namespace Vector.Api.Models.Product
{
    public class CreateProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal? SalePrice { get; set; }
    }

    public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
    {
        public CreateProductRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Unit).NotEmpty().MaximumLength(20);
            RuleFor(x => x.SalePrice).GreaterThanOrEqualTo(0).When(x => x.SalePrice.HasValue);
            RuleFor(x => x.Description).MaximumLength(1000);
        }
    }
}
