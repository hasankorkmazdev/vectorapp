using System.Collections.Generic;
using FluentValidation;

namespace Vector.Api.Models.Customer
{
    public class UpdateCustomerRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public List<string> Phone { get; set; } = new();
        public List<string> Email { get; set; } = new();
    }

    public class UpdateCustomerRequestValidator : AbstractValidator<UpdateCustomerRequest>
    {
        public UpdateCustomerRequestValidator()
        {
            RuleFor(x => x.CompanyName).NotEmpty();
            RuleFor(x => x.TaxNumber).MaximumLength(11).Matches("^[0-9]*$").When(x => !string.IsNullOrEmpty(x.TaxNumber));
        }
    }
}
