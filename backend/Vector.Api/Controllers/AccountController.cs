using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Account;
using Vector.Api.Models.Common;
using Vector.Api.Services.Account;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        [RequiresOrganization]
        [EnableQuery(PageSize = 100)]
        public IQueryable<AccountListDto> GetAll()
        {
            var orgId = this.GetOrganizationId();
            return _accountService.GetQueryable(orgId);
        }

        [HttpGet("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> GetById(System.Guid id)
        {
            var orgId = this.GetOrganizationId();
            var account = await _accountService.GetByIdAsync(orgId, id);
            if (account == null)
                return NotFound(Result.Failure("Account not found.", 404));
            return Ok(Result<AccountDto>.Success(account, "Account retrieved successfully."));
        }

        [HttpPost]
        [RequiresOrganization]
        public async Task<IActionResult> Create([FromBody] CreateAccountRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var account = await _accountService.CreateAsync(orgId, userId, request);
            return Ok(Result<AccountDto>.Success(account, "Account created successfully.", 201));
        }

        [HttpPut("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Update(System.Guid id, [FromBody] UpdateAccountRequest request)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var account = await _accountService.UpdateAsync(orgId, userId, id, request);
            if (account == null)
                return NotFound(Result.Failure("Account not found.", 404));
            return Ok(Result<AccountDto>.Success(account, "Account updated successfully."));
        }

        [HttpDelete("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Delete(System.Guid id)
        {
            var userId = this.GetUserId();
            var orgId = this.GetOrganizationId();
            var deleted = await _accountService.DeleteAsync(orgId, userId, id);
            if (!deleted)
                return NotFound(Result.Failure("Account not found.", 404));
            return Ok(Result.Success("Account deleted successfully."));
        }

        // Contact endpoints

        [HttpPost("{accountId}/contacts")]
        [RequiresOrganization]
        public async Task<IActionResult> CreateContact(System.Guid accountId, [FromBody] CreateContactRequest request)
        {
            var orgId = this.GetOrganizationId();
            var contact = await _accountService.CreateContactAsync(orgId, accountId, request);
            if (contact == null)
                return NotFound(Result.Failure("Account not found.", 404));
            return Ok(Result<AccountContactDto>.Success(contact, "Contact created successfully.", 201));
        }

        [HttpPut("{accountId}/contacts/{contactId}")]
        [RequiresOrganization]
        public async Task<IActionResult> UpdateContact(System.Guid accountId, System.Guid contactId, [FromBody] UpdateContactRequest request)
        {
            var orgId = this.GetOrganizationId();
            var contact = await _accountService.UpdateContactAsync(orgId, accountId, contactId, request);
            if (contact == null)
                return NotFound(Result.Failure("Contact not found.", 404));
            return Ok(Result<AccountContactDto>.Success(contact, "Contact updated successfully."));
        }

        [HttpDelete("{accountId}/contacts/{contactId}")]
        [RequiresOrganization]
        public async Task<IActionResult> DeleteContact(System.Guid accountId, System.Guid contactId)
        {
            var orgId = this.GetOrganizationId();
            var deleted = await _accountService.DeleteContactAsync(orgId, accountId, contactId);
            if (!deleted)
                return NotFound(Result.Failure("Contact not found.", 404));
            return Ok(Result.Success("Contact deleted successfully."));
        }

        // Address endpoints

        [HttpPost("{accountId}/addresses")]
        [RequiresOrganization]
        public async Task<IActionResult> CreateAddress(System.Guid accountId, [FromBody] CreateAddressRequest request)
        {
            var orgId = this.GetOrganizationId();
            var address = await _accountService.CreateAddressAsync(orgId, accountId, request);
            if (address == null)
                return NotFound(Result.Failure("Account not found.", 404));
            return Ok(Result<AccountAddressDto>.Success(address, "Address created successfully.", 201));
        }

        [HttpPut("{accountId}/addresses/{addressId}")]
        [RequiresOrganization]
        public async Task<IActionResult> UpdateAddress(System.Guid accountId, System.Guid addressId, [FromBody] UpdateAddressRequest request)
        {
            var orgId = this.GetOrganizationId();
            var address = await _accountService.UpdateAddressAsync(orgId, accountId, addressId, request);
            if (address == null)
                return NotFound(Result.Failure("Address not found.", 404));
            return Ok(Result<AccountAddressDto>.Success(address, "Address updated successfully."));
        }

        [HttpDelete("{accountId}/addresses/{addressId}")]
        [RequiresOrganization]
        public async Task<IActionResult> DeleteAddress(System.Guid accountId, System.Guid addressId)
        {
            var orgId = this.GetOrganizationId();
            var deleted = await _accountService.DeleteAddressAsync(orgId, accountId, addressId);
            if (!deleted)
                return NotFound(Result.Failure("Address not found.", 404));
            return Ok(Result.Success("Address deleted successfully."));
        }

        // Tag endpoints

        [HttpPost("{accountId}/tags/{tagId}")]
        [RequiresOrganization]
        public async Task<IActionResult> AssignTag(System.Guid accountId, System.Guid tagId)
        {
            var orgId = this.GetOrganizationId();
            var assigned = await _accountService.AssignTagAsync(orgId, accountId, tagId);
            if (!assigned)
                return NotFound(Result.Failure("Account or tag not found.", 404));
            return Ok(Result.Success("Tag assigned successfully."));
        }

        [HttpDelete("{accountId}/tags/{tagId}")]
        [RequiresOrganization]
        public async Task<IActionResult> RemoveTag(System.Guid accountId, System.Guid tagId)
        {
            var orgId = this.GetOrganizationId();
            var removed = await _accountService.RemoveTagAsync(orgId, accountId, tagId);
            if (!removed)
                return NotFound(Result.Failure("Tag assignment not found.", 404));
            return Ok(Result.Success("Tag removed successfully."));
        }
    }
}
