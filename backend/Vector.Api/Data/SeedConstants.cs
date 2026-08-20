using System;

namespace Vector.Api.Data
{
    public static class SeedConstants
    {
        // Role IDs
        public static readonly Guid AdminRoleId = Guid.Parse("00000000-0000-0000-0000-000000000011");
        public static readonly Guid OrganizationAdminRoleId = Guid.Parse("00000000-0000-0000-0000-000000000013");
        public static readonly Guid FinanceRoleId = Guid.Parse("00000000-0000-0000-0000-000000000014");
        public static readonly Guid MechanicRoleId = Guid.Parse("00000000-0000-0000-0000-000000000015");

        // Permission IDs
        public static readonly Guid SuperAdminPermissionId = Guid.Parse("00000000-0000-0000-0000-000000000090");

        // User IDs
        public static readonly Guid AdminUserId = Guid.Parse("00000000-0000-0000-0000-000000000020");
        public static readonly Guid hasankorkmazdevId = Guid.Parse("00000000-0000-0000-0000-000000000021");
        public static readonly Guid OrganizationAdminUserId = Guid.Parse("00000000-0000-0000-0000-000000000022");
        public static readonly Guid UnassociatedOrganizationAdminUserId = Guid.Parse("00000000-0000-0000-0000-000000000023");

        // Organization IDs
        public static readonly Guid OrganizationKBB = Guid.Parse("00000000-0000-0000-0000-000000000030");
        public static readonly Guid Organization2Id = Guid.Parse("00000000-0000-0000-0000-000000000031");

        // Warehouse IDs
        public static readonly Guid DefaultWarehouseId = Guid.Parse("00000000-0000-0000-0000-000000000040");
        public static readonly Guid WorkshopWarehouseId = Guid.Parse("00000000-0000-0000-0000-000000000041");
        public static readonly Guid GeneralWorkshopWarehouseId = Guid.Parse("00000000-0000-0000-0000-000000000042");

        // Product Group IDs
        public static readonly Guid ProductGroupOilId = Guid.Parse("00000000-0000-0000-0000-000000000050");
        public static readonly Guid ProductGroupFilterId = Guid.Parse("00000000-0000-0000-0000-000000000051");
        public static readonly Guid ProductGroupBearingId = Guid.Parse("00000000-0000-0000-0000-000000000052");
        public static readonly Guid ProductGroupHydraulicId = Guid.Parse("00000000-0000-0000-0000-000000000053");
        public static readonly Guid ProductGroupElectricalId = Guid.Parse("00000000-0000-0000-0000-000000000054");

        // Account IDs (former suppliers)
        public static readonly Guid Account3Id = Guid.Parse("00000000-0000-0000-0000-000000000060");
        public static readonly Guid Account4Id = Guid.Parse("00000000-0000-0000-0000-000000000061");

        // Tag IDs
        public static readonly Guid TagCustomerId = Guid.Parse("00000000-0000-0000-0000-000000000080");
        public static readonly Guid TagSupplierId = Guid.Parse("00000000-0000-0000-0000-000000000081");

        // Product IDs
        public static readonly Guid ProductOilId = Guid.Parse("00000000-0000-0000-0000-000000000070");
        public static readonly Guid ProductFilterId = Guid.Parse("00000000-0000-0000-0000-000000000071");
        public static readonly Guid ProductBearingId = Guid.Parse("00000000-0000-0000-0000-000000000072");
        public static readonly Guid ProductHydraulicHoseId = Guid.Parse("00000000-0000-0000-0000-000000000073");
        public static readonly Guid ProductMotorId = Guid.Parse("00000000-0000-0000-0000-000000000074");
        public static readonly Guid ProductCableId = Guid.Parse("00000000-0000-0000-0000-000000000075");
        public static readonly Guid ProductSealKitId = Guid.Parse("00000000-0000-0000-0000-000000000076");
        public static readonly Guid ProductGreaseId = Guid.Parse("00000000-0000-0000-0000-000000000077");
    }
}
