using System;
using System.Collections.Generic;

namespace Vector.Api.Models.Customer
{
    public class CustomerDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public List<string> Phone { get; set; } = new();
        public List<string> Email { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<CustomerContactDto> Contacts { get; set; } = new();
        public List<CustomerAddressDto> Addresses { get; set; } = new();
    }

    public class CustomerContactDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Gsm { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class CustomerAddressDto
    {
        public Guid Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }
        public string? Address { get; set; }
        public bool IsPrimary { get; set; }
    }
}
