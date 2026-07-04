using Vector.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Vector.Api.Data
{
    public static class DbInitializer
    {
        public static void Seed(ApplicationDbContext context)
        {
            SeedPermissions(context);
            SeedRoles(context);
            SeedRolePermissions(context);
            SeedUsers(context);
            SeedOrganizations(context);
            SeedOrganizationMembers(context);
            SeedCustomers(context);
        }

        private static void SeedPermissions(ApplicationDbContext context)
        {
            var permissions = new PermissionEntity[]
            {
            };

            if (permissions.Length > 0)
            {
                context.AddOrUpdate(permissions);
                context.SaveChanges();
            }
        }

        private static void SeedRoles(ApplicationDbContext context)
        {
            var roles = new RoleEntity[]
            {
                new() { Id = SeedConstants.OwnerRoleId, Name = "Owner" },
                new() { Id = SeedConstants.AdminRoleId, Name = "Admin" },
                new() { Id = SeedConstants.MemberRoleId, Name = "Member" },
            };

            context.AddOrUpdate(roles);
            context.SaveChanges();
        }

        private static void SeedRolePermissions(ApplicationDbContext context)
        {
        }

        private static void SeedUsers(ApplicationDbContext context)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var hashedPwd = Convert.ToBase64String(sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes("1302197342")));

            var users = new UserEntity[]
            {
                new()
                {
                    Id = SeedConstants.AdminUserId,
                    FullName = "System Administrator",
                    Email = "admin@vector.com",
                    PasswordHash = hashedPwd,
                    IsEmailVerified = true,
                    IsPhoneVerified = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.hasankorkmazdevId,
                    FullName = "System Administrator",
                    Email = "hasankorkmazdev@gmail.com",
                    PasswordHash = hashedPwd,
                    IsEmailVerified = true,
                    IsPhoneVerified = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.OrganizationAdminUserId,
                    FullName = "Hasan Karaca",
                    Email = "karacahasan42@gmail.com",
                    PasswordHash = hashedPwd,
                    IsEmailVerified = true,
                    IsPhoneVerified = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.UnassociatedOrganizationAdminUserId,
                    FullName = "Hasan Korkmaz",
                    Email = "karacahasan42is@gmail.com",
                    PasswordHash = hashedPwd,
                    IsEmailVerified = true,
                    IsPhoneVerified = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.AddOrUpdate(users);
            context.SaveChanges();
        }

        private static void SeedOrganizations(ApplicationDbContext context)
        {
            var organizations = new OrganizationEntity[]
            {
                new()
                {
                    Id = SeedConstants.OrganizationKBB,
                    Name = "KMZ Makine Sistem",
                    TaxNumber = "1234567890",
                    TaxOffice = "Alaaddin Vergi Dairesi",
                    Address = " Fevziçakmak, SILA CAD KOBİSAN 3 SAN. SİT, 42050 Karatay/Konya",
                    SupportedLanguages = new() { "tr", "en" },
                    DefaultLanguage = "tr",
                    CreatedAt = DateTime.UtcNow
                },
            };

            context.AddOrUpdate(organizations);
            context.SaveChanges();
        }

        private static void SeedOrganizationMembers(ApplicationDbContext context)
        {
            var memberships = new OrganizationMemberEntity[]
            {
                new()
                {
                    Id = Guid.Parse("C0B67CA1-94A7-4F31-8801-90BDC3BE7FE0"),
                    OrganizationId = SeedConstants.OrganizationKBB,
                    UserId = SeedConstants.OrganizationAdminUserId,
                    RoleId = SeedConstants.OwnerRoleId,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.Parse("84BF7E9B-A85E-475A-9E0F-1DBE008CEF5D"),
                    OrganizationId = SeedConstants.OrganizationKBB,
                    UserId = SeedConstants.hasankorkmazdevId,
                    RoleId = SeedConstants.OwnerRoleId,
                    CreatedAt = DateTime.UtcNow
                },
            };

            context.AddOrUpdate(memberships);
            context.SaveChanges();
        }

        private static void SeedCustomers(ApplicationDbContext context)
        {
            var customerId = Guid.Parse("00000000-0000-0000-0000-000000000001");

            var customers = new CustomerEntity[]
            {
                new()
                {
                    Id = customerId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "C0001",
                    CompanyName = "Sonne Piston",
                    TaxNumber = "7890123456",
                    TaxOffice = "Büyükmükellefler",
                    Phone = new() { "(0332) 345 33 33" },
                    Email = new(),
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow,
                }
            };

            context.AddOrUpdate(customers);
            context.SaveChanges();

            var addresses = new CustomerAddressEntity[]
            {
                new()
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                    CustomerId = customerId,
                    Label = "Merkez",
                    Country = "Türkiye",
                    City = "Konya",
                    District = "Selçuklu",
                    PostalCode = "42050",
                    Address = "K.O.S.B, Büyükkayacık OSB, 18 Nolu Sokak No:3",
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow,
                }
            };

            context.AddOrUpdate(addresses);
            context.SaveChanges();

            var contacts = new CustomerContactEntity[]
            {
                new()
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                    CustomerId = customerId,
                    FullName = "Hıfzı Korkmaz",
                    Phone = "(0332) 345 33 33",
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow,
                }
            };

            context.AddOrUpdate(contacts);
            context.SaveChanges();
        }
    }
}
