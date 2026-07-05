using FluentValidation;

namespace Vector.Api.Models.Customer
{
    public class CreateContactRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Gsm { get; set; }
        public bool IsPrimary { get; set; } = false;
    }

    public class CreateContactRequestValidator : AbstractValidator<CreateContactRequest>
    {
        private const string PhonePattern = @"^(?:\+?90|0)?\s*(?:\(?([2-5]\d{2})\)?)[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$";
        private const string EmailPattern = @"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$";

        public CreateContactRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty();
            RuleFor(x => x.Email).Matches(EmailPattern).When(x => !string.IsNullOrEmpty(x.Email));
            RuleFor(x => x.Phone).Matches(PhonePattern).When(x => !string.IsNullOrEmpty(x.Phone));
            RuleFor(x => x.Gsm).Matches(PhonePattern).When(x => !string.IsNullOrEmpty(x.Gsm));
        }
    }

    public class UpdateContactRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Gsm { get; set; }
        public bool IsPrimary { get; set; } = false;
    }

    public class UpdateContactRequestValidator : AbstractValidator<UpdateContactRequest>
    {
        private const string PhonePattern = @"^(?:\+?90|0)?\s*(?:\(?([2-5]\d{2})\)?)[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$";
        private const string EmailPattern = @"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$";

        public UpdateContactRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty();
            RuleFor(x => x.Email).Matches(EmailPattern).When(x => !string.IsNullOrEmpty(x.Email));
            RuleFor(x => x.Phone).Matches(PhonePattern).When(x => !string.IsNullOrEmpty(x.Phone));
            RuleFor(x => x.Gsm).Matches(PhonePattern).When(x => !string.IsNullOrEmpty(x.Gsm));
        }
    }
}
