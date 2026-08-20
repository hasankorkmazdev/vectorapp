using System;

namespace Vector.Api.Models.Maintenance
{
    public class EquipmentListDto
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public string? AccountName { get; set; }
        public Guid? ProductId { get; set; }
        public string? ProductName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Manufacturer { get; set; }
        public string? Model { get; set; }
        public string? SerialNumber { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
