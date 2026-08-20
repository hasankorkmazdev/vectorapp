using System;
using System.Collections.Generic;
using Vector.Api.Entities.Account;
using Vector.Api.Entities.User;

namespace Vector.Api.Entities.Maintenance
{
    public class MaintenanceWorkOrderEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid EquipmentId { get; set; }
        public Guid AccountId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public MaintenanceWorkOrderStatus Status { get; set; } = MaintenanceWorkOrderStatus.Open;
        public Guid? AssignedToUserId { get; set; }
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public decimal? LaborCost { get; set; }
        public string? Currency { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public Guid? CreatedById { get; set; }
        public Guid? UpdatedById { get; set; }

        public EquipmentEntity? Equipment { get; set; }
        public AccountEntity? Account { get; set; }
        public UserEntity? AssignedToUser { get; set; }
        public List<MaintenanceWorkOrderItemEntity> Items { get; set; } = new();
        public List<MaintenanceNoteEntity> Notes { get; set; } = new();
    }
}
