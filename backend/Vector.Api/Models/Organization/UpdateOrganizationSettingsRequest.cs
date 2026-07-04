using System.Collections.Generic;
using FluentValidation;

namespace Vector.Api.Models.Organization
{
    public class UpdateOrganizationSettingsRequest
    {
        public List<string> SupportedLanguages { get; set; } = new();
        public string DefaultLanguage { get; set; } = "tr";
        public bool PriceVariesByLanguage { get; set; } = false;
    }

    public class UpdateOrganizationSettingsRequestValidator : AbstractValidator<UpdateOrganizationSettingsRequest>
    {
        public UpdateOrganizationSettingsRequestValidator()
        {
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
