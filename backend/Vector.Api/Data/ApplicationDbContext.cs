using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Vector.Api.Entities.Account;
using Vector.Api.Entities.Auth;
using Vector.Api.Entities.Common;
using Vector.Api.Entities.Inventory;
using Vector.Api.Entities.Maintenance;
using Vector.Api.Entities.Organization;
using Vector.Api.Entities.Product;
using Vector.Api.Entities.Tag;
using Vector.Api.Entities.User;
using System;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
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
        public DbSet<AccountEntity> Accounts => Set<AccountEntity>();
        public DbSet<AccountContactEntity> AccountContacts => Set<AccountContactEntity>();
        public DbSet<AccountAddressEntity> AccountAddresses => Set<AccountAddressEntity>();
        public DbSet<TagEntity> Tags => Set<TagEntity>();
        public DbSet<AccountTagEntity> AccountTagLinks => Set<AccountTagEntity>();
        public DbSet<ProductEntity> Products => Set<ProductEntity>();
        public DbSet<BomItemEntity> BomItems => Set<BomItemEntity>();
        public DbSet<StockMovementEntity> StockMovements => Set<StockMovementEntity>();
        public DbSet<WarehouseEntity> Warehouses => Set<WarehouseEntity>();
        public DbSet<ProductGroupEntity> ProductGroups => Set<ProductGroupEntity>();
        public DbSet<EquipmentEntity> Equipment => Set<EquipmentEntity>();
        public DbSet<MaintenanceWorkOrderEntity> MaintenanceWorkOrders => Set<MaintenanceWorkOrderEntity>();
        public DbSet<MaintenanceWorkOrderItemEntity> MaintenanceWorkOrderItems => Set<MaintenanceWorkOrderItemEntity>();
        public DbSet<MaintenanceNoteEntity> MaintenanceNotes => Set<MaintenanceNoteEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            if (Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
            {
                var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

                modelBuilder.Entity<AccountEntity>()
                    .Property(c => c.Phone)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, jsonOptions),
                        v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new());

                modelBuilder.Entity<AccountEntity>()
                    .Property(c => c.Email)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, jsonOptions),
                        v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new());

                modelBuilder.Entity<OrganizationEntity>()
                    .Property(o => o.SupportedLanguages)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, jsonOptions),
                        v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new());
            }

            // Configure Plural Table Names explicitly
            modelBuilder.Entity<UserEntity>().ToTable("Users");
            modelBuilder.Entity<ActivityEntity>().ToTable("Activities");
            modelBuilder.Entity<RoleEntity>().ToTable("Roles");
            modelBuilder.Entity<PermissionEntity>().ToTable("Permissions");
            modelBuilder.Entity<RolePermissionEntity>().ToTable("RolePermissions");
            modelBuilder.Entity<OrganizationEntity>().ToTable("Organizations");
            modelBuilder.Entity<RefreshTokenEntity>().ToTable("RefreshTokens");
            modelBuilder.Entity<OrganizationMemberEntity>().ToTable("OrganizationMembers");
            modelBuilder.Entity<AccountEntity>().ToTable("Accounts");
            modelBuilder.Entity<AccountContactEntity>().ToTable("AccountContacts");
            modelBuilder.Entity<AccountAddressEntity>().ToTable("AccountAddresses");
            modelBuilder.Entity<TagEntity>().ToTable("Tags");
            modelBuilder.Entity<AccountTagEntity>().ToTable("AccountTags");
            modelBuilder.Entity<ProductEntity>().ToTable("Products");
            modelBuilder.Entity<BomItemEntity>().ToTable("BomItems");
            modelBuilder.Entity<StockMovementEntity>().ToTable("StockMovements");
            modelBuilder.Entity<WarehouseEntity>().ToTable("Warehouses");
            modelBuilder.Entity<ProductGroupEntity>().ToTable("ProductGroups");
            modelBuilder.Entity<EquipmentEntity>().ToTable("Equipment");
            modelBuilder.Entity<MaintenanceWorkOrderEntity>().ToTable("MaintenanceWorkOrders");
            modelBuilder.Entity<MaintenanceWorkOrderItemEntity>().ToTable("MaintenanceWorkOrderItems");
            modelBuilder.Entity<MaintenanceNoteEntity>().ToTable("MaintenanceNotes");

            // Composite keys
            modelBuilder.Entity<RolePermissionEntity>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            modelBuilder.Entity<AccountTagEntity>()
                .HasKey(at => new { at.AccountId, at.TagId });

            // Global Query Filters for Soft Delete
            modelBuilder.Entity<UserEntity>().HasQueryFilter(u => u.DeletedAt == null);
            modelBuilder.Entity<OrganizationEntity>().HasQueryFilter(o => o.DeletedAt == null);
            modelBuilder.Entity<OrganizationMemberEntity>().HasQueryFilter(om => om.DeletedAt == null);
            modelBuilder.Entity<AccountEntity>().HasQueryFilter(c => c.DeletedAt == null);
            modelBuilder.Entity<AccountContactEntity>().HasQueryFilter(co => co.DeletedAt == null);
            modelBuilder.Entity<AccountAddressEntity>().HasQueryFilter(a => a.DeletedAt == null);
            modelBuilder.Entity<TagEntity>().HasQueryFilter(t => t.DeletedAt == null);
            modelBuilder.Entity<ProductEntity>().HasQueryFilter(p => p.DeletedAt == null);
            modelBuilder.Entity<BomItemEntity>().HasQueryFilter(b => b.DeletedAt == null);
            modelBuilder.Entity<WarehouseEntity>().HasQueryFilter(w => w.DeletedAt == null);
            modelBuilder.Entity<ProductGroupEntity>().HasQueryFilter(g => g.DeletedAt == null);
            modelBuilder.Entity<EquipmentEntity>().HasQueryFilter(e => e.DeletedAt == null);

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

            modelBuilder.Entity<AccountEntity>()
                .HasIndex(c => c.OrganizationId);

            modelBuilder.Entity<AccountEntity>()
                .HasIndex(c => new { c.OrganizationId, c.Code })
                .IsUnique();

            modelBuilder.Entity<AccountContactEntity>()
                .HasOne(co => co.Account)
                .WithMany(c => c.Contacts)
                .HasForeignKey(co => co.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AccountAddressEntity>()
                .HasOne(a => a.Account)
                .WithMany(c => c.Addresses)
                .HasForeignKey(a => a.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AccountTagEntity>()
                .HasOne(at => at.Account)
                .WithMany(a => a.AccountTags)
                .HasForeignKey(at => at.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AccountTagEntity>()
                .HasOne(at => at.Tag)
                .WithMany(t => t.AccountTags)
                .HasForeignKey(at => at.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TagEntity>()
                .HasIndex(t => t.OrganizationId);

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
                .HasOne(m => m.Warehouse)
                .WithMany()
                .HasForeignKey(m => m.WarehouseId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<StockMovementEntity>()
                .HasOne(m => m.Account)
                .WithMany()
                .HasForeignKey(m => m.AccountId)
                .OnDelete(DeleteBehavior.SetNull);

            // Warehouse indexes
            modelBuilder.Entity<WarehouseEntity>()
                .HasIndex(w => w.OrganizationId);

            modelBuilder.Entity<WarehouseEntity>()
                .HasIndex(w => new { w.OrganizationId, w.Code })
                .IsUnique();

            // Equipment relationships
            modelBuilder.Entity<EquipmentEntity>()
                .HasOne(e => e.Account)
                .WithMany()
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EquipmentEntity>()
                .HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<EquipmentEntity>()
                .HasIndex(e => e.OrganizationId);

            modelBuilder.Entity<EquipmentEntity>()
                .HasIndex(e => new { e.OrganizationId, e.AccountId });

            // MaintenanceWorkOrder relationships
            modelBuilder.Entity<MaintenanceWorkOrderEntity>()
                .HasOne(w => w.Equipment)
                .WithMany()
                .HasForeignKey(w => w.EquipmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MaintenanceWorkOrderEntity>()
                .HasOne(w => w.Account)
                .WithMany()
                .HasForeignKey(w => w.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MaintenanceWorkOrderEntity>()
                .HasOne(w => w.AssignedToUser)
                .WithMany()
                .HasForeignKey(w => w.AssignedToUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MaintenanceWorkOrderEntity>()
                .HasIndex(w => w.OrganizationId);

            modelBuilder.Entity<MaintenanceWorkOrderEntity>()
                .HasIndex(w => new { w.OrganizationId, w.Status });

            modelBuilder.Entity<MaintenanceWorkOrderEntity>()
                .HasIndex(w => new { w.OrganizationId, w.EquipmentId });

            // MaintenanceWorkOrderItem relationships
            modelBuilder.Entity<MaintenanceWorkOrderItemEntity>()
                .HasOne(i => i.WorkOrder)
                .WithMany(w => w.Items)
                .HasForeignKey(i => i.WorkOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MaintenanceWorkOrderItemEntity>()
                .HasOne(i => i.Product)
                .WithMany()
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MaintenanceWorkOrderItemEntity>()
                .HasOne(i => i.StockMovement)
                .WithMany()
                .HasForeignKey(i => i.StockMovementId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MaintenanceWorkOrderItemEntity>()
                .HasIndex(i => i.WorkOrderId);

            // MaintenanceNote relationships
            modelBuilder.Entity<MaintenanceNoteEntity>()
                .HasOne(n => n.WorkOrder)
                .WithMany(w => w.Notes)
                .HasForeignKey(n => n.WorkOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MaintenanceNoteEntity>()
                .HasOne(n => n.CreatedBy)
                .WithMany()
                .HasForeignKey(n => n.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MaintenanceNoteEntity>()
                .HasIndex(n => n.WorkOrderId);

            // StockMovement -> MaintenanceWorkOrder link
            modelBuilder.Entity<StockMovementEntity>()
                .HasOne<MaintenanceWorkOrderEntity>()
                .WithMany()
                .HasForeignKey(m => m.WorkOrderId)
                .OnDelete(DeleteBehavior.SetNull);

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
