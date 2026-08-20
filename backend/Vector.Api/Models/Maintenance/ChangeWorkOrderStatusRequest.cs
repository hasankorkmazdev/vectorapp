using FluentValidation;
using Vector.Api.Entities.Maintenance;

namespace Vector.Api.Models.Maintenance
{
    public class ChangeWorkOrderStatusRequest
    {
        public MaintenanceWorkOrderStatus Status { get; set; }
    }

    public class ChangeWorkOrderStatusRequestValidator : AbstractValidator<ChangeWorkOrderStatusRequest>
    {
        public ChangeWorkOrderStatusRequestValidator()
        {
            RuleFor(x => x.Status).IsInEnum();
        }
    }
}
