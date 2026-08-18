using System;
using System.Collections.Generic;
using Vector.Api.Entities.Account;

namespace Vector.Api.Entities.Tag
{
    public class TagEntity
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        public List<AccountTagEntity> AccountTags { get; set; } = new();
    }
}
