using System;
using System.Collections.Generic;

namespace Vector.Api.Models.Organization
{
    public class OrganizationDetailsResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public string? Address { get; set; }
        public bool IsSetupRequired { get; set; }
        public List<string> SupportedLanguages { get; set; } = new();
        public string DefaultLanguage { get; set; } = "tr";
        public bool PriceVariesByLanguage { get; set; } = false;
        public List<OrganizationMemberDto> Members { get; set; } = new List<OrganizationMemberDto>();
    }
}
