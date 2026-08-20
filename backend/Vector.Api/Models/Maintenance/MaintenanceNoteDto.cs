using System;

namespace Vector.Api.Models.Maintenance
{
    public class MaintenanceNoteDto
    {
        public Guid Id { get; set; }
        public string Body { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Guid CreatedById { get; set; }
        public string? CreatedByName { get; set; }
    }
}
