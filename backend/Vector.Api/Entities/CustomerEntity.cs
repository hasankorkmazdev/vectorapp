using System;
using System.Collections.Generic;

namespace Vector.Api.Entities
{
    public class CustomerEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public List<string> Phone { get; set; } = new();
        public List<string> Email { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? CreatedById { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? DeletedById { get; set; }

        public List<CustomerContactEntity> Contacts { get; set; } = new();
        public List<CustomerAddressEntity> Addresses { get; set; } = new();
    }
}
