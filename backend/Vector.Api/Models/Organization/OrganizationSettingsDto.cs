using System.Collections.Generic;

namespace Vector.Api.Models.Organization
{
    public class OrganizationSettingsDto
    {
        public List<string> SupportedLanguages { get; set; } = new();
        public string DefaultLanguage { get; set; } = "tr";
        public bool PriceVariesByLanguage { get; set; } = false;
        public Dictionary<string, string> LanguageCurrencies { get; set; } = new();
    }
}
