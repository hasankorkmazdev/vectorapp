using System;
using System.Collections.Generic;
using Vector.Api.Models.Tag;

namespace Vector.Api.Models.Account
{
    public class AccountDto
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
        public List<AccountContactDto> Contacts { get; set; } = new();
        public List<AccountAddressDto> Addresses { get; set; } = new();
        public List<TagDto> Tags { get; set; } = new();
    }

    public class AccountContactDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Gsm { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class AccountAddressDto
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
