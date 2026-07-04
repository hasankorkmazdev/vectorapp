using FluentValidation;

namespace Vector.Api.Models.Customer
{
    public class CreateAddressRequest
    {
        public string Label { get; set; } = string.Empty;
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }
        public string? Address { get; set; }
        public bool IsPrimary { get; set; } = false;
    }

    public class CreateAddressRequestValidator : AbstractValidator<CreateAddressRequest>
    {
        public CreateAddressRequestValidator()
        {
            RuleFor(x => x.Label).NotEmpty();
        }
    }

    public class UpdateAddressRequest
    {
        public string Label { get; set; } = string.Empty;
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }
        public string? Address { get; set; }
        public bool IsPrimary { get; set; } = false;
    }

    public class UpdateAddressRequestValidator : AbstractValidator<UpdateAddressRequest>
    {
        public UpdateAddressRequestValidator()
        {
            RuleFor(x => x.Label).NotEmpty();
        }
    }
}
