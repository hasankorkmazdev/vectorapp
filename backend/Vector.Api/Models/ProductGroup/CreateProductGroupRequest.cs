using FluentValidation;

namespace Vector.Api.Models.ProductGroup
{
    public class CreateProductGroupRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    public class CreateProductGroupRequestValidator : AbstractValidator<CreateProductGroupRequest>
    {
        public CreateProductGroupRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        }
    }
}
