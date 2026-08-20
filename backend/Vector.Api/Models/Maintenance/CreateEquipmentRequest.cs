using System;
using FluentValidation;

namespace Vector.Api.Models.Maintenance
{
    public class CreateEquipmentRequest
    {
        public Guid AccountId { get; set; }
        public Guid? ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Manufacturer { get; set; }
        public string? Model { get; set; }
        public string? SerialNumber { get; set; }
        public string? Note { get; set; }
    }

    public class CreateEquipmentRequestValidator : AbstractValidator<CreateEquipmentRequest>
    {
        public CreateEquipmentRequestValidator()
        {
            RuleFor(x => x.AccountId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Category).MaximumLength(100);
            RuleFor(x => x.Manufacturer).MaximumLength(100);
            RuleFor(x => x.Model).MaximumLength(100);
            RuleFor(x => x.SerialNumber).MaximumLength(100);
            RuleFor(x => x.Note).MaximumLength(1000);
        }
    }
}
