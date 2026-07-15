using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Warehouse;
using Vector.Api.Services.Warehouse;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WarehouseController : ControllerBase
    {
        private readonly IWarehouseService _warehouseService;

        public WarehouseController(IWarehouseService warehouseService)
        {
            _warehouseService = warehouseService;
        }

        [HttpGet]
        [RequiresOrganization]
        [EnableQuery(PageSize = 100)]
        public IQueryable<WarehouseListDto> GetAll()
        {
            var orgId = this.GetOrganizationId();
            return _warehouseService.GetQueryable(orgId);
        }
    }
}
