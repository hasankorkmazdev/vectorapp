using System;

namespace Vector.Api.Data
{
    public static class SeedConstants
    {
        // Role IDs
        public static readonly Guid OwnerRoleId = Guid.Parse("00000000-0000-0000-0000-000000000010");
        public static readonly Guid AdminRoleId = Guid.Parse("00000000-0000-0000-0000-000000000011");
        public static readonly Guid MemberRoleId = Guid.Parse("00000000-0000-0000-0000-000000000012");
        public static readonly Guid ViewerRoleId = Guid.Parse("00000000-0000-0000-0000-000000000013");

        // User IDs
        public static readonly Guid AdminUserId = Guid.Parse("00000000-0000-0000-0000-000000000020");
        public static readonly Guid hasankorkmazdevId = Guid.Parse("00000000-0000-0000-0000-000000000021");
        public static readonly Guid OrganizationAdminUserId = Guid.Parse("00000000-0000-0000-0000-000000000022");
        public static readonly Guid UnassociatedOrganizationAdminUserId = Guid.Parse("00000000-0000-0000-0000-000000000023");

        // Organization IDs
        public static readonly Guid OrganizationKBB = Guid.Parse("00000000-0000-0000-0000-000000000030");
        public static readonly Guid Organization2Id = Guid.Parse("00000000-0000-0000-0000-000000000031");
    }
}
