using System;
using System.Linq;
using Vector.Api.Models.Warehouse;

namespace Vector.Api.Services.Warehouse
{
    public interface IWarehouseService
    {
        IQueryable<WarehouseListDto> GetQueryable(Guid organizationId);
    }
}
