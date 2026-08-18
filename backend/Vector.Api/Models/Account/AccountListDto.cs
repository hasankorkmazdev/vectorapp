using System;
using System.Collections.Generic;
using Vector.Api.Models.Tag;

namespace Vector.Api.Models.Account
{
    public class AccountListDto
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
        public List<TagDto> Tags { get; set; } = new();
    }
}
