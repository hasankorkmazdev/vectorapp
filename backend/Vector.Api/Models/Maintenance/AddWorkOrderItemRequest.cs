using System;
using FluentValidation;
using Vector.Api.Entities.Maintenance;

namespace Vector.Api.Models.Maintenance
{
    public class AddWorkOrderItemRequest
    {
        public MaintenanceWorkOrderItemType Type { get; set; }
        public Guid? ProductId { get; set; }
        public string? Description { get; set; }
        public decimal Quantity { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Note { get; set; }
    }

    public class AddWorkOrderItemRequestValidator : AbstractValidator<AddWorkOrderItemRequest>
    {
        public AddWorkOrderItemRequestValidator()
        {
            RuleFor(x => x.Type).IsInEnum();
            RuleFor(x => x.Quantity).GreaterThan(0);
            RuleFor(x => x.ProductId)
                .NotEmpty()
                .When(x => x.Type == MaintenanceWorkOrderItemType.Part);
            RuleFor(x => x.Description)
                .NotEmpty()
                .MaximumLength(200)
                .When(x => x.Type == MaintenanceWorkOrderItemType.Labor);
            RuleFor(x => x.UnitCost)
                .NotNull()
                .GreaterThanOrEqualTo(0)
                .When(x => x.Type == MaintenanceWorkOrderItemType.Labor);
            RuleFor(x => x.Note).MaximumLength(500);
        }
    }
}
