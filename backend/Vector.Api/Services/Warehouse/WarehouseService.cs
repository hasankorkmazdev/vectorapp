using System;
using System.Linq;
using Vector.Api.Data;
using Vector.Api.Models.Warehouse;

namespace Vector.Api.Services.Warehouse
{
    public class WarehouseService : IWarehouseService
    {
        private readonly ApplicationDbContext _context;

        public WarehouseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<WarehouseListDto> GetQueryable(Guid organizationId)
        {
            return _context.Warehouses
                .Where(w => w.OrganizationId == organizationId)
                .Select(w => new WarehouseListDto
                {
                    Id = w.Id,
                    Code = w.Code,
                    Name = w.Name,
                    Location = w.Location,
                    IsActive = w.IsActive,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = w.UpdatedAt
                });
        }
    }
}
