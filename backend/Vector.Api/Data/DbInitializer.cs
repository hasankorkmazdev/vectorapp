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
            SeedWarehouses(context);
            SeedProductGroups(context);
            SeedSuppliers(context);
            SeedProducts(context);
            SeedStockMovements(context);
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
            var customer1Id = Guid.Parse("00000000-0000-0000-0000-000000000001");
            var customer2Id = Guid.Parse("7779e5f8-8d14-4b6e-918a-6dca8d3980fe");

            var customers = new CustomerEntity[]
            {
                new()
                {
                    Id = customer1Id,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "C0001",
                    CompanyName = "Sonne Piston",
                    TaxNumber = "7890123456",
                    TaxOffice = "Büyükmükellefler",
                    Phone = new() { "(0332) 345 33 33" },
                    Email = new(),
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow,
                },
                new()
                {
                    Id = customer2Id,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "C0003",
                    CompanyName = "Akkor Kalıp",
                    TaxNumber = "12412412414",
                    TaxOffice = "Aladdin V.D",
                    Phone = new() { "05075751463", "5354080032" },
                    Email = new() { "info@akkorkalip.com" },
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
                    CustomerId = customer1Id,
                    Label = "Merkez",
                    Country = "Türkiye",
                    City = "Konya",
                    District = "Selçuklu",
                    PostalCode = "42050",
                    Address = "K.O.S.B, Büyükkayacık OSB, 18 Nolu Sokak No:3",
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow,
                },
                new()
                {
                    Id = Guid.Parse("c4a8ead6-255b-4e31-b297-0648cf79d26d"),
                    CustomerId = customer2Id,
                    Label = "Fabrika Adres",
                    Country = "Türkiye",
                    City = "Konya",
                    District = "Selçuklu",
                    PostalCode = "42050",
                    Address = "Fevziçakmak, SILA CAD KOBİSAN 3 SAN. SİT, Karatay/Konya",
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
                    CustomerId = customer1Id,
                    FullName = "Hıfzı Korkmaz",
                    Phone = "(0332) 345 33 33",
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow,
                },
                new()
                {
                    Id = Guid.Parse("599e9835-72b8-4f9f-bb82-320b240be9cc"),
                    CustomerId = customer2Id,
                    FullName = "Omer Osman Korkmaz",
                    Title = "Şirket Sahibi",
                    Email = "omerosmankorkmaz@akkorkalip.com",
                    Phone = "05075751463",
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow,
                }
            };

            context.AddOrUpdate(contacts);
            context.SaveChanges();
        }

        private static void SeedWarehouses(ApplicationDbContext context)
        {
            var warehouses = new WarehouseEntity[]
            {
                new()
                {
                    Id = SeedConstants.DefaultWarehouseId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "WH001",
                    Name = "Ana Depo",
                    Location = "Konya",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.AddOrUpdate(warehouses);
            context.SaveChanges();
        }

        private static void SeedProductGroups(ApplicationDbContext context)
        {
            var groups = new ProductGroupEntity[]
            {
                new()
                {
                    Id = SeedConstants.ProductGroupOilId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Name = "Yağlar",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductGroupFilterId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Name = "Filtreler",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductGroupBearingId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Name = "Rulmanlar",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductGroupHydraulicId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Name = "Hidrolik Ekipmanlar",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductGroupElectricalId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Name = "Elektrik Ekipmanları",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.AddOrUpdate(groups);
            context.SaveChanges();
        }

        private static void SeedSuppliers(ApplicationDbContext context)
        {
            var suppliers = new SupplierEntity[]
            {
                new()
                {
                    Id = SeedConstants.Supplier1Id,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "SUP001",
                    Name = "Konya Yağ Sanayi",
                    Phone = "(0332) 500 00 00",
                    Email = "info@konyayag.com",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.Supplier2Id,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "SUP002",
                    Name = "Anadolu Filtre",
                    Phone = "(0312) 400 00 00",
                    Email = "info@anadolufiltre.com",
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.AddOrUpdate(suppliers);
            context.SaveChanges();
        }

        private static void SeedProducts(ApplicationDbContext context)
        {
            var products = new ProductEntity[]
            {
                new()
                {
                    Id = SeedConstants.ProductOilId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "PRD001",
                    Name = "Hidrolik Yağ 68",
                    Description = "ISO VG 68 hidrolik sistem yağı",
                    Unit = "Litre",
                    SalePrice = 450,
                    SellingCurrency = "TRY",
                    StockQuantity = 120,
                    AvgCost = 320,
                    LastPurchasePrice = 320,
                    GroupId = SeedConstants.ProductGroupOilId,
                    IsActive = true,
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductFilterId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "PRD002",
                    Name = "Yağ Filtresi - PF2056",
                    Description = "Gelişmiş filtreleme performansı",
                    Unit = "Adet",
                    SalePrice = 280,
                    SellingCurrency = "TRY",
                    StockQuantity = 0,
                    GroupId = SeedConstants.ProductGroupFilterId,
                    IsActive = true,
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductBearingId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "PRD003",
                    Name = "Rulman 6205-2RS",
                    Description = "Mühürlü bilyalı rulman",
                    Unit = "Adet",
                    SalePrice = 12,
                    SellingCurrency = "EUR",
                    StockQuantity = 50,
                    AvgCost = 210,
                    LastPurchasePrice = 210,
                    GroupId = SeedConstants.ProductGroupBearingId,
                    IsActive = true,
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductHydraulicHoseId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "PRD004",
                    Name = "Hidrolik Hortum 1/2\"",
                    Description = "Çelik örgü reinforced hidrolik hortum",
                    Unit = "Metre",
                    SalePrice = 600,
                    SellingCurrency = "TRY",
                    StockQuantity = 0,
                    GroupId = SeedConstants.ProductGroupHydraulicId,
                    IsActive = true,
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductMotorId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "PRD005",
                    Name = "Elektrik Motoru 2.2kW",
                    Description = "3 faz asenkron motor",
                    Unit = "Adet",
                    SalePrice = 280,
                    SellingCurrency = "USD",
                    StockQuantity = 5,
                    AvgCost = 6200,
                    LastPurchasePrice = 6200,
                    GroupId = SeedConstants.ProductGroupElectricalId,
                    IsActive = true,
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductCableId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "PRD006",
                    Name = "NYA Kablo 4x2.5mm²",
                    Description = "Bakır iletkenli kablo",
                    Unit = "Metre",
                    SalePrice = 85,
                    SellingCurrency = "TRY",
                    StockQuantity = 0,
                    GroupId = SeedConstants.ProductGroupElectricalId,
                    IsActive = true,
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductSealKitId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "PRD007",
                    Name = "Conta Seti - SK100",
                    Description = "Hidrolik silindir conta takımı",
                    Unit = "Set",
                    SalePrice = 1500,
                    SellingCurrency = "TRY",
                    StockQuantity = 15,
                    AvgCost = 950,
                    LastPurchasePrice = 950,
                    GroupId = SeedConstants.ProductGroupHydraulicId,
                    IsActive = true,
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = SeedConstants.ProductGreaseId,
                    OrganizationId = SeedConstants.OrganizationKBB,
                    Code = "PRD008",
                    Name = "Gres Yağı EP2",
                    Description = "Genel amaçlı EP gres yağı",
                    Unit = "Kg",
                    SalePrice = 250,
                    SellingCurrency = "TRY",
                    StockQuantity = 0,
                    GroupId = SeedConstants.ProductGroupOilId,
                    IsActive = true,
                    CreatedById = SeedConstants.OrganizationAdminUserId,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.AddOrUpdate(products);
            context.SaveChanges();
        }

        private static void SeedStockMovements(ApplicationDbContext context)
        {
            var stockProducts = new (Guid ProductId, decimal Quantity, decimal UnitCost)[]
            {
                (SeedConstants.ProductOilId, 120, 320),
                (SeedConstants.ProductBearingId, 50, 210),
                (SeedConstants.ProductMotorId, 5, 6200),
                (SeedConstants.ProductSealKitId, 15, 950),
            };

            var movements = stockProducts.Select(sp => new StockMovementEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = SeedConstants.OrganizationKBB,
                ProductId = sp.ProductId,
                Quantity = sp.Quantity,
                UnitCost = sp.UnitCost,
                Currency = "TRY",
                TotalCost = sp.Quantity * sp.UnitCost,
                Type = "In",
                WarehouseId = SeedConstants.DefaultWarehouseId,
                Note = "Initial seed stock",
                CreatedById = SeedConstants.OrganizationAdminUserId,
                CreatedAt = DateTime.UtcNow
            }).ToArray();

            context.AddOrUpdate(movements);
            context.SaveChanges();
        }
    }
}
