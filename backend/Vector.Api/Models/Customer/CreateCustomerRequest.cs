using System.Collections.Generic;
using FluentValidation;

namespace Vector.Api.Models.Customer
{
    public class CreateCustomerRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public List<string> Phone { get; set; } = new();
        public List<string> Email { get; set; } = new();
    }

    public class CreateCustomerRequestValidator : AbstractValidator<CreateCustomerRequest>
    {
        public CreateCustomerRequestValidator()
        {
            RuleFor(x => x.CompanyName).NotEmpty();
        }
    }
}
