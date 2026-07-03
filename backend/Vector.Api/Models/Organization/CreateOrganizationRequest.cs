using FluentValidation;

namespace Vector.Api.Models.Organization
{
    public class CreateOrganizationRequest
    {
        public string Name { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public string TaxOffice { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class CreateOrganizationRequestValidator : AbstractValidator<CreateOrganizationRequest>
    {
        public CreateOrganizationRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MinimumLength(3);

            RuleFor(x => x.TaxNumber)
                .NotEmpty()
                .Length(10)
                .Matches(@"^\d+$");

            RuleFor(x => x.TaxOffice)
                .NotEmpty();

            RuleFor(x => x.Address)
                .NotEmpty();
        }
    }
}
