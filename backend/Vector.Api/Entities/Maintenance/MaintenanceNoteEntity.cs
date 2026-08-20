using System;
using Vector.Api.Entities.User;

namespace Vector.Api.Entities.Maintenance
{
    public class MaintenanceNoteEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid WorkOrderId { get; set; }
        public string Body { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid CreatedById { get; set; }

        public MaintenanceWorkOrderEntity? WorkOrder { get; set; }
        public UserEntity? CreatedBy { get; set; }
    }
}
