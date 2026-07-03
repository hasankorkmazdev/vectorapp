using System.Collections.Generic;
using FluentValidation;

namespace Vector.Api.Models.Organization
{
    public class CompleteSetupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public string TaxOffice { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public List<string> SupportedLanguages { get; set; } = new();
        public string DefaultLanguage { get; set; } = "tr";
        public bool PriceVariesByLanguage { get; set; } = false;
        public Dictionary<string, string> LanguageCurrencies { get; set; } = new();
    }

    public class CompleteSetupRequestValidator : AbstractValidator<CompleteSetupRequest>
    {
        public CompleteSetupRequestValidator()
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

            RuleFor(x => x.SupportedLanguages).NotEmpty();
            RuleFor(x => x.DefaultLanguage).NotEmpty();
            RuleFor(x => x).Custom((request, context) =>
            {
                if (!request.SupportedLanguages.Contains(request.DefaultLanguage))
                {
                    context.AddFailure("DefaultLanguage", "Default language must be one of the supported languages.");
                }
            });
        }
    }
}
