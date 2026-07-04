using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Customer;
using Vector.Api.Models.Common;
using Vector.Api.Services.Customer;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        [RequiresOrganization]
        [EnableQuery(PageSize = 100)]
        public IQueryable<CustomerListDto> GetAll()
        {
            var orgId = this.GetOrganizationId();
            return _customerService.GetQueryable(orgId);
        }

        [HttpGet("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> GetById(System.Guid id)
        {
            var orgId = this.GetOrganizationId();
            var customer = await _customerService.GetByIdAsync(orgId, id);
            if (customer == null)
                return NotFound(Result.Failure("Customer not found.", 404));
            return Ok(Result<CustomerDto>.Success(customer, "Customer retrieved successfully."));
        }

        [HttpPost]
        [RequiresOrganization]
        public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var customer = await _customerService.CreateAsync(orgId, userId, request);
            return Ok(Result<CustomerDto>.Success(customer, "Customer created successfully.", 201));
        }

        [HttpPut("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Update(System.Guid id, [FromBody] UpdateCustomerRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var customer = await _customerService.UpdateAsync(orgId, userId, id, request);
            if (customer == null)
                return NotFound(Result.Failure("Customer not found.", 404));
            return Ok(Result<CustomerDto>.Success(customer, "Customer updated successfully."));
        }

        [HttpDelete("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Delete(System.Guid id)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var deleted = await _customerService.DeleteAsync(orgId, userId, id);
            if (!deleted)
                return NotFound(Result.Failure("Customer not found.", 404));
            return Ok(Result.Success("Customer deleted successfully."));
        }

        // Contact endpoints

        [HttpPost("{customerId}/contacts")]
        [RequiresOrganization]
        public async Task<IActionResult> CreateContact(System.Guid customerId, [FromBody] CreateContactRequest request)
        {
            var orgId = this.GetOrganizationId();
            var contact = await _customerService.CreateContactAsync(orgId, customerId, request);
            if (contact == null)
                return NotFound(Result.Failure("Customer not found.", 404));
            return Ok(Result<CustomerContactDto>.Success(contact, "Contact created successfully.", 201));
        }

        [HttpPut("{customerId}/contacts/{contactId}")]
        [RequiresOrganization]
        public async Task<IActionResult> UpdateContact(System.Guid customerId, System.Guid contactId, [FromBody] UpdateContactRequest request)
        {
            var orgId = this.GetOrganizationId();
            var contact = await _customerService.UpdateContactAsync(orgId, customerId, contactId, request);
            if (contact == null)
                return NotFound(Result.Failure("Contact not found.", 404));
            return Ok(Result<CustomerContactDto>.Success(contact, "Contact updated successfully."));
        }

        [HttpDelete("{customerId}/contacts/{contactId}")]
        [RequiresOrganization]
        public async Task<IActionResult> DeleteContact(System.Guid customerId, System.Guid contactId)
        {
            var orgId = this.GetOrganizationId();
            var deleted = await _customerService.DeleteContactAsync(orgId, customerId, contactId);
            if (!deleted)
                return NotFound(Result.Failure("Contact not found.", 404));
            return Ok(Result.Success("Contact deleted successfully."));
        }

        // Address endpoints

        [HttpPost("{customerId}/addresses")]
        [RequiresOrganization]
        public async Task<IActionResult> CreateAddress(System.Guid customerId, [FromBody] CreateAddressRequest request)
        {
            var orgId = this.GetOrganizationId();
            var address = await _customerService.CreateAddressAsync(orgId, customerId, request);
            if (address == null)
                return NotFound(Result.Failure("Customer not found.", 404));
            return Ok(Result<CustomerAddressDto>.Success(address, "Address created successfully.", 201));
        }

        [HttpPut("{customerId}/addresses/{addressId}")]
        [RequiresOrganization]
        public async Task<IActionResult> UpdateAddress(System.Guid customerId, System.Guid addressId, [FromBody] UpdateAddressRequest request)
        {
            var orgId = this.GetOrganizationId();
            var address = await _customerService.UpdateAddressAsync(orgId, customerId, addressId, request);
            if (address == null)
                return NotFound(Result.Failure("Address not found.", 404));
            return Ok(Result<CustomerAddressDto>.Success(address, "Address updated successfully."));
        }

        [HttpDelete("{customerId}/addresses/{addressId}")]
        [RequiresOrganization]
        public async Task<IActionResult> DeleteAddress(System.Guid customerId, System.Guid addressId)
        {
            var orgId = this.GetOrganizationId();
            var deleted = await _customerService.DeleteAddressAsync(orgId, customerId, addressId);
            if (!deleted)
                return NotFound(Result.Failure("Address not found.", 404));
            return Ok(Result.Success("Address deleted successfully."));
        }
    }
}
