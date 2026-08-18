using FluentValidation;

namespace Vector.Api.Models.Tag
{
    public class CreateTagRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
    }

    public class CreateTagRequestValidator : AbstractValidator<CreateTagRequest>
    {
        public CreateTagRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Color).MaximumLength(20).When(x => x.Color != null);
        }
    }
}
