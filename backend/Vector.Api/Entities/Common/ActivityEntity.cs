using System;
using Vector.Api.Entities.User;

namespace Vector.Api.Entities.Common
{
    public class ActivityEntity
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public UserEntity? User { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
