using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Entities;
using Vector.Api.Models.Supplier;

namespace Vector.Api.Services.Supplier
{
    public class SupplierService : ISupplierService
    {
        private readonly ApplicationDbContext _context;

        public SupplierService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<SupplierListDto> GetQueryable(Guid organizationId)
        {
            return _context.Suppliers
                .Where(s => s.OrganizationId == organizationId)
                .Select(s => new SupplierListDto
                {
                    Id = s.Id,
                    Code = s.Code,
                    Name = s.Name,
                    Phone = s.Phone,
                    Email = s.Email,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                });
        }

        public async Task<SupplierListDto> CreateAsync(Guid organizationId, Guid userId, CreateSupplierRequest request)
        {
            var maxCode = await _context.Suppliers
                .Where(s => s.OrganizationId == organizationId)
                .MaxAsync(s => (string?)s.Code);

            var nextNumber = 1;
            if (maxCode != null && maxCode.StartsWith('S') && int.TryParse(maxCode[1..], out var lastNumber))
                nextNumber = lastNumber + 1;

            var entity = new SupplierEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Code = $"S{nextNumber:D4}",
                Name = request.Name,
                Phone = request.Phone,
                Email = request.Email,
                CreatedById = userId
            };

            _context.Suppliers.Add(entity);
            await _context.SaveChangesAsync();

            return new SupplierListDto
            {
                Id = entity.Id,
                Code = entity.Code,
                Name = entity.Name,
                Phone = entity.Phone,
                Email = entity.Email,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        public async Task<SupplierListDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateSupplierRequest request)
        {
            var entity = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.OrganizationId == organizationId && s.Id == id);

            if (entity == null)
                return null;

            entity.Name = request.Name;
            entity.Phone = request.Phone;
            entity.Email = request.Email;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedById = userId;

            await _context.SaveChangesAsync();

            return new SupplierListDto
            {
                Id = entity.Id,
                Code = entity.Code,
                Name = entity.Name,
                Phone = entity.Phone,
                Email = entity.Email,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id)
        {
            var entity = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.OrganizationId == organizationId && s.Id == id);

            if (entity == null)
                return false;

            _context.Suppliers.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
