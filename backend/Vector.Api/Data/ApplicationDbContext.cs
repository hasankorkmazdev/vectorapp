using Microsoft.EntityFrameworkCore;
using Vector.Api.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Vector.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            IHttpContextAccessor? httpContextAccessor = null) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<UserEntity> Users => Set<UserEntity>();
        public DbSet<ActivityEntity> Activities => Set<ActivityEntity>();
        public DbSet<RoleEntity> Roles => Set<RoleEntity>();
        public DbSet<PermissionEntity> Permissions => Set<PermissionEntity>();
        public DbSet<RolePermissionEntity> RolePermissions => Set<RolePermissionEntity>();
        public DbSet<OrganizationEntity> Organizations => Set<OrganizationEntity>();
        public DbSet<OrganizationMemberEntity> OrganizationMembers => Set<OrganizationMemberEntity>();
        public DbSet<RefreshTokenEntity> RefreshTokens => Set<RefreshTokenEntity>();
        public DbSet<CustomerEntity> Customers => Set<CustomerEntity>();
        public DbSet<CustomerContactEntity> CustomerContacts => Set<CustomerContactEntity>();
        public DbSet<CustomerAddressEntity> CustomerAddresses => Set<CustomerAddressEntity>();
        public DbSet<ProductEntity> Products => Set<ProductEntity>();
        public DbSet<BomItemEntity> BomItems => Set<BomItemEntity>();
        public DbSet<StockMovementEntity> StockMovements => Set<StockMovementEntity>();
        public DbSet<SupplierEntity> Suppliers => Set<SupplierEntity>();
        public DbSet<WarehouseEntity> Warehouses => Set<WarehouseEntity>();
        public DbSet<ProductGroupEntity> ProductGroups => Set<ProductGroupEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Plural Table Names explicitly
            modelBuilder.Entity<UserEntity>().ToTable("Users");
            modelBuilder.Entity<ActivityEntity>().ToTable("Activities");
            modelBuilder.Entity<RoleEntity>().ToTable("Roles");
            modelBuilder.Entity<PermissionEntity>().ToTable("Permissions");
            modelBuilder.Entity<RolePermissionEntity>().ToTable("RolePermissions");
            modelBuilder.Entity<OrganizationEntity>().ToTable("Organizations");
            modelBuilder.Entity<RefreshTokenEntity>().ToTable("RefreshTokens");
            modelBuilder.Entity<OrganizationMemberEntity>().ToTable("OrganizationMembers");
            modelBuilder.Entity<CustomerEntity>().ToTable("Customers");
            modelBuilder.Entity<CustomerContactEntity>().ToTable("CustomerContacts");
            modelBuilder.Entity<CustomerAddressEntity>().ToTable("CustomerAddresses");
            modelBuilder.Entity<ProductEntity>().ToTable("Products");
            modelBuilder.Entity<BomItemEntity>().ToTable("BomItems");
            modelBuilder.Entity<StockMovementEntity>().ToTable("StockMovements");
            modelBuilder.Entity<SupplierEntity>().ToTable("Suppliers");
            modelBuilder.Entity<WarehouseEntity>().ToTable("Warehouses");
            modelBuilder.Entity<ProductGroupEntity>().ToTable("ProductGroups");

            // Composite keys
            modelBuilder.Entity<RolePermissionEntity>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            // Global Query Filters for Soft Delete
            modelBuilder.Entity<UserEntity>().HasQueryFilter(u => u.DeletedAt == null);
            modelBuilder.Entity<OrganizationEntity>().HasQueryFilter(o => o.DeletedAt == null);
            modelBuilder.Entity<OrganizationMemberEntity>().HasQueryFilter(om => om.DeletedAt == null);
            modelBuilder.Entity<CustomerEntity>().HasQueryFilter(c => c.DeletedAt == null);
            modelBuilder.Entity<CustomerContactEntity>().HasQueryFilter(co => co.DeletedAt == null);
            modelBuilder.Entity<CustomerAddressEntity>().HasQueryFilter(a => a.DeletedAt == null);
            modelBuilder.Entity<ProductEntity>().HasQueryFilter(p => p.DeletedAt == null);
            modelBuilder.Entity<BomItemEntity>().HasQueryFilter(b => b.DeletedAt == null);
            modelBuilder.Entity<SupplierEntity>().HasQueryFilter(s => s.DeletedAt == null);
            modelBuilder.Entity<WarehouseEntity>().HasQueryFilter(w => w.DeletedAt == null);
            modelBuilder.Entity<ProductGroupEntity>().HasQueryFilter(g => g.DeletedAt == null);

            // Relations
            modelBuilder.Entity<OrganizationMemberEntity>()
                .HasOne(om => om.Organization)
                .WithMany(o => o.Members)
                .HasForeignKey(om => om.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrganizationMemberEntity>()
                .HasOne(om => om.User)
                .WithMany(u => u.OrganizationMembers)
                .HasForeignKey(om => om.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RefreshTokenEntity>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshTokenEntity>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            modelBuilder.Entity<OrganizationMemberEntity>()
                .HasOne(om => om.Role)
                .WithMany()
                .HasForeignKey(om => om.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CustomerEntity>()
                .HasIndex(c => c.OrganizationId);

            modelBuilder.Entity<CustomerEntity>()
                .HasIndex(c => new { c.OrganizationId, c.Code })
                .IsUnique();

            modelBuilder.Entity<CustomerContactEntity>()
                .HasOne(co => co.Customer)
                .WithMany(c => c.Contacts)
                .HasForeignKey(co => co.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CustomerAddressEntity>()
                .HasOne(a => a.Customer)
                .WithMany(c => c.Addresses)
                .HasForeignKey(a => a.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Product indexes
            modelBuilder.Entity<ProductEntity>()
                .HasIndex(p => p.OrganizationId);

            modelBuilder.Entity<ProductEntity>()
                .HasIndex(p => new { p.OrganizationId, p.Code })
                .IsUnique();

            // BomItem relationships
            modelBuilder.Entity<BomItemEntity>()
                .HasOne(b => b.ParentProduct)
                .WithMany(p => p.ParentBomItems)
                .HasForeignKey(b => b.ParentProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BomItemEntity>()
                .HasOne(b => b.ComponentProduct)
                .WithMany(p => p.ComponentBomItems)
                .HasForeignKey(b => b.ComponentProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BomItemEntity>()
                .HasIndex(b => b.OrganizationId);

            // Supplier indexes
            modelBuilder.Entity<SupplierEntity>()
                .HasIndex(s => s.OrganizationId);

            modelBuilder.Entity<SupplierEntity>()
                .HasIndex(s => new { s.OrganizationId, s.Code })
                .IsUnique();

            // StockMovement relationships
            modelBuilder.Entity<StockMovementEntity>()
                .HasOne(m => m.Product)
                .WithMany(p => p.StockMovements)
                .HasForeignKey(m => m.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockMovementEntity>()
                .HasIndex(m => m.OrganizationId);

            modelBuilder.Entity<StockMovementEntity>()
                .HasIndex(m => m.ProductId);

            modelBuilder.Entity<StockMovementEntity>()
                .HasOne(m => m.Supplier)
                .WithMany()
                .HasForeignKey(m => m.SupplierId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<StockMovementEntity>()
                .HasOne(m => m.Warehouse)
                .WithMany()
                .HasForeignKey(m => m.WarehouseId)
                .OnDelete(DeleteBehavior.SetNull);

            // Warehouse indexes
            modelBuilder.Entity<WarehouseEntity>()
                .HasIndex(w => w.OrganizationId);

            modelBuilder.Entity<WarehouseEntity>()
                .HasIndex(w => new { w.OrganizationId, w.Code })
                .IsUnique();

            // AutoIncludes for User roles & permissions
            modelBuilder.Entity<RoleEntity>()
                .Navigation(r => r.RolePermissions)
                .AutoInclude();

            modelBuilder.Entity<RolePermissionEntity>()
                .Navigation(rp => rp.Permission)
                .AutoInclude();
        }

        public override int SaveChanges()
        {
            ApplySoftDeleteAndAuditLogs();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplySoftDeleteAndAuditLogs();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private Guid? CurrentOrganizationId
        {
            get
            {
                var items = _httpContextAccessor?.HttpContext?.Items;
                if (items != null && items.TryGetValue("OrganizationId", out var val) && val is Guid orgId)
                    return orgId;
                return null;
            }
        }

        private Guid? GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor?.HttpContext;
            var userIdStr = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                return userId;
            }
            return null;
        }

        private void ApplySoftDeleteAndAuditLogs()
        {
            var currentUserId = GetCurrentUserId();
            var entries = ChangeTracker.Entries();

            foreach (var entry in entries.ToList())
            {
                // Soft Delete Logic
                if (entry.State == EntityState.Deleted)
                {
                    // Check if entity supports soft delete
                    var deletedAtProp = entry.Metadata.FindProperty("DeletedAt");
                    if (deletedAtProp != null && deletedAtProp.ClrType == typeof(DateTime?))
                    {
                        entry.State = EntityState.Modified;
                        entry.CurrentValues["DeletedAt"] = DateTime.UtcNow;

                        var deletedByProp = entry.Metadata.FindProperty("DeletedById");
                        if (deletedByProp != null && deletedByProp.ClrType == typeof(Guid?))
                        {
                            entry.CurrentValues["DeletedById"] = currentUserId;
                        }

                        // Create Audit Log for deletion
                        LogActivity("Delete", entry.Metadata.Name, GetPrimaryKeyValue(entry).ToString() ?? string.Empty);
                    }
                }
                else if (entry.State == EntityState.Added)
                {
                    var createdAtProp = entry.Metadata.FindProperty("CreatedAt");
                    if (createdAtProp != null && createdAtProp.ClrType == typeof(DateTime))
                    {
                        entry.CurrentValues["CreatedAt"] = DateTime.UtcNow;
                    }

                    var createdByProp = entry.Metadata.FindProperty("CreatedById");
                    if (createdByProp != null && createdByProp.ClrType == typeof(Guid?))
                    {
                        entry.CurrentValues["CreatedById"] = currentUserId;
                    }
                }
                else if (entry.State == EntityState.Modified)
                {
                    var updatedAtProp = entry.Metadata.FindProperty("UpdatedAt");
                    if (updatedAtProp != null && updatedAtProp.ClrType == typeof(DateTime?))
                    {
                        entry.CurrentValues["UpdatedAt"] = DateTime.UtcNow;
                    }

                    var updatedByProp = entry.Metadata.FindProperty("UpdatedById");
                    if (updatedByProp != null && updatedByProp.ClrType == typeof(Guid?))
                    {
                        entry.CurrentValues["UpdatedById"] = currentUserId;
                    }

                    // Create Audit Log for update (if not auditing itself)
                    if (entry.Metadata.Name != typeof(ActivityEntity).FullName)
                    {
                        LogActivity("Update", entry.Metadata.Name, GetPrimaryKeyValue(entry).ToString() ?? string.Empty);
                    }
                }
            }
        }

        private object GetPrimaryKeyValue(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            var keyName = entry.Metadata.FindPrimaryKey()?.Properties.Select(x => x.Name).FirstOrDefault();
            if (keyName == null) return string.Empty;
            return entry.CurrentValues[keyName] ?? string.Empty;
        }

        private void LogActivity(string action, string entityName, string entityId)
        {
            var shortEntityName = entityName.Split('.').Last();
            
            if (shortEntityName == "ActivityEntity") return;

            var activity = new ActivityEntity
            {
                Id = Guid.NewGuid(),
                Action = action,
                EntityName = shortEntityName,
                EntityId = entityId,
                Details = $"{action} operation executed on {shortEntityName} with ID: {entityId}.",
                CreatedAt = DateTime.UtcNow
            };

            Activities.Add(activity);
        }
    }
}
