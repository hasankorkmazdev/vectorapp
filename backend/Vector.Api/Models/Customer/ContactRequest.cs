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
        public CreateContactRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty();
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
        public UpdateContactRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty();
        }
    }
}
