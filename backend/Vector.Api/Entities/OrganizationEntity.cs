using System;
using System.Collections.Generic;

namespace Vector.Api.Entities
{
    public class OrganizationEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public string? Address { get; set; }
        public bool IsSetupRequired { get; set; } = false;
        public List<string> SupportedLanguages { get; set; } = new() { "tr" };
        public string DefaultLanguage { get; set; } = "tr";
        public bool PriceVariesByLanguage { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        public List<OrganizationMemberEntity> Members { get; set; } = new List<OrganizationMemberEntity>();
    }
}
