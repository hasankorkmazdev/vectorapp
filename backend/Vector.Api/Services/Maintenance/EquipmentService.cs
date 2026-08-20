using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Entities.Maintenance;
using Vector.Api.Models.Maintenance;

namespace Vector.Api.Services.Maintenance
{
    public class EquipmentService : IEquipmentService
    {
        private readonly ApplicationDbContext _context;

        public EquipmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<EquipmentListDto> GetQueryable(Guid organizationId)
        {
            return _context.Equipment
                .Where(e => e.OrganizationId == organizationId)
                .Select(e => new EquipmentListDto
                {
                    Id = e.Id,
                    AccountId = e.AccountId,
                    AccountName = e.Account != null ? e.Account.CompanyName : null,
                    ProductId = e.ProductId,
                    ProductName = e.Product != null ? e.Product.Name : null,
                    Name = e.Name,
                    Category = e.Category,
                    Manufacturer = e.Manufacturer,
                    Model = e.Model,
                    SerialNumber = e.SerialNumber,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt
                });
        }

        public async Task<EquipmentDto?> GetByIdAsync(Guid organizationId, Guid id)
        {
            return await _context.Equipment
                .Where(e => e.OrganizationId == organizationId && e.Id == id)
                .Select(e => new EquipmentDto
                {
                    Id = e.Id,
                    AccountId = e.AccountId,
                    AccountName = e.Account != null ? e.Account.CompanyName : null,
                    ProductId = e.ProductId,
                    ProductName = e.Product != null ? e.Product.Name : null,
                    Name = e.Name,
                    Category = e.Category,
                    Manufacturer = e.Manufacturer,
                    Model = e.Model,
                    SerialNumber = e.SerialNumber,
                    Note = e.Note,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<EquipmentDto> CreateAsync(Guid organizationId, Guid userId, CreateEquipmentRequest request)
        {
            var entity = new EquipmentEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                AccountId = request.AccountId,
                ProductId = request.ProductId,
                Name = request.Name,
                Category = request.Category,
                Manufacturer = request.Manufacturer,
                Model = request.Model,
                SerialNumber = request.SerialNumber,
                Note = request.Note,
                CreatedById = userId
            };

            _context.Equipment.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(organizationId, entity.Id))!;
        }

        public async Task<EquipmentDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateEquipmentRequest request)
        {
            var entity = await _context.Equipment
                .FirstOrDefaultAsync(e => e.OrganizationId == organizationId && e.Id == id);

            if (entity == null) return null;

            entity.AccountId = request.AccountId;
            entity.ProductId = request.ProductId;
            entity.Name = request.Name;
            entity.Category = request.Category;
            entity.Manufacturer = request.Manufacturer;
            entity.Model = request.Model;
            entity.SerialNumber = request.SerialNumber;
            entity.Note = request.Note;
            entity.IsActive = request.IsActive;
            entity.UpdatedById = userId;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(organizationId, id);
        }

        public async Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id)
        {
            var entity = await _context.Equipment
                .FirstOrDefaultAsync(e => e.OrganizationId == organizationId && e.Id == id);

            if (entity == null) return false;

            _context.Equipment.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
