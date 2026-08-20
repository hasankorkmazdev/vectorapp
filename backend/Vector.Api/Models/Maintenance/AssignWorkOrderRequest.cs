using System;
using FluentValidation;

namespace Vector.Api.Models.Maintenance
{
    public class AssignWorkOrderRequest
    {
        public Guid AssignedToUserId { get; set; }
    }

    public class AssignWorkOrderRequestValidator : AbstractValidator<AssignWorkOrderRequest>
    {
        public AssignWorkOrderRequestValidator()
        {
            RuleFor(x => x.AssignedToUserId).NotEmpty();
        }
    }
}
