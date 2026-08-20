using System;
using Vector.Api.Entities.Maintenance;

namespace Vector.Api.Models.Maintenance
{
    public class MaintenanceWorkOrderListDto
    {
        public Guid Id { get; set; }
        public Guid EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public Guid AccountId { get; set; }
        public string? AccountName { get; set; }
        public string Title { get; set; } = string.Empty;
        public MaintenanceWorkOrderStatus Status { get; set; }
        public Guid? AssignedToUserId { get; set; }
        public string? AssignedToUserName { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public decimal? LaborCost { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
