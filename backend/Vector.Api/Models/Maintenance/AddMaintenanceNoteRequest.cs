using FluentValidation;

namespace Vector.Api.Models.Maintenance
{
    public class AddMaintenanceNoteRequest
    {
        public string Body { get; set; } = string.Empty;
    }

    public class AddMaintenanceNoteRequestValidator : AbstractValidator<AddMaintenanceNoteRequest>
    {
        public AddMaintenanceNoteRequestValidator()
        {
            RuleFor(x => x.Body).NotEmpty().MaximumLength(2000);
        }
    }
}
