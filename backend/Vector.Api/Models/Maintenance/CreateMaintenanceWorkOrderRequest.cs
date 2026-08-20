using System;
using FluentValidation;

namespace Vector.Api.Models.Maintenance
{
    public class CreateMaintenanceWorkOrderRequest
    {
        public Guid EquipmentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? AssignedToUserId { get; set; }
    }

    public class CreateMaintenanceWorkOrderRequestValidator : AbstractValidator<CreateMaintenanceWorkOrderRequest>
    {
        public CreateMaintenanceWorkOrderRequestValidator()
        {
            RuleFor(x => x.EquipmentId).NotEmpty();
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Description).MaximumLength(2000);
        }
    }
}
