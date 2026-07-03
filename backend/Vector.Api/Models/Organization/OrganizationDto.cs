using System;
using System.Collections.Generic;

namespace Vector.Api.Models.Organization
{
    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public bool IsSetupRequired { get; set; }
        public List<string> SupportedLanguages { get; set; } = new();
        public string DefaultLanguage { get; set; } = "tr";
    }
}
