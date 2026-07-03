using System;

namespace Vector.Api.Models.Organization
{
    public class OrganizationMemberDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? OrganizationRole { get; set; }
    }
}
