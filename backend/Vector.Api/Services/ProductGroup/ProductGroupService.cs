using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Entities;
using Vector.Api.Models.ProductGroup;

namespace Vector.Api.Services.ProductGroup
{
    public class ProductGroupService : IProductGroupService
    {
        private readonly ApplicationDbContext _context;

        public ProductGroupService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<ProductGroupDto> GetQueryable(Guid organizationId)
        {
            return _context.ProductGroups
                .Where(g => g.OrganizationId == organizationId)
                .Select(g => new ProductGroupDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    IsActive = g.IsActive,
                    CreatedAt = g.CreatedAt,
                    UpdatedAt = g.UpdatedAt
                });
        }

        public async Task<ProductGroupDto> CreateAsync(Guid organizationId, Guid userId, CreateProductGroupRequest request)
        {
            var entity = new ProductGroupEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Name = request.Name,
                CreatedById = userId
            };

            _context.ProductGroups.Add(entity);
            await _context.SaveChangesAsync();

            return new ProductGroupDto
            {
                Id = entity.Id,
                Name = entity.Name,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(Guid organizationId, Guid id)
        {
            var entity = await _context.ProductGroups
                .FirstOrDefaultAsync(g => g.OrganizationId == organizationId && g.Id == id);

            if (entity == null) return false;

            _context.ProductGroups.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
