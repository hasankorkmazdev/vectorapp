using System;

namespace Vector.Api.Entities
{
    public class OrganizationMemberEntity
    {
        public Guid Id { get; set; }
        
        public Guid OrganizationId { get; set; }
        public OrganizationEntity? Organization { get; set; }
        
        public Guid UserId { get; set; }
        public UserEntity? User { get; set; }
        
        public Guid RoleId { get; set; }
        public RoleEntity? Role { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
