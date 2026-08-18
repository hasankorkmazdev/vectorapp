using System;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.Account;

namespace Vector.Api.Services.Account
{
    public interface IAccountService
    {
        IQueryable<AccountListDto> GetQueryable(Guid organizationId);
        Task<AccountDto?> GetByIdAsync(Guid organizationId, Guid id);
        Task<AccountDto> CreateAsync(Guid organizationId, Guid userId, CreateAccountRequest request);
        Task<AccountDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateAccountRequest request);
        Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id);

        Task<AccountContactDto?> CreateContactAsync(Guid organizationId, Guid accountId, CreateContactRequest request);
        Task<AccountContactDto?> UpdateContactAsync(Guid organizationId, Guid accountId, Guid contactId, UpdateContactRequest request);
        Task<bool> DeleteContactAsync(Guid organizationId, Guid accountId, Guid contactId);

        Task<AccountAddressDto?> CreateAddressAsync(Guid organizationId, Guid accountId, CreateAddressRequest request);
        Task<AccountAddressDto?> UpdateAddressAsync(Guid organizationId, Guid accountId, Guid addressId, UpdateAddressRequest request);
        Task<bool> DeleteAddressAsync(Guid organizationId, Guid accountId, Guid addressId);

        Task<bool> AssignTagAsync(Guid organizationId, Guid accountId, Guid tagId);
        Task<bool> RemoveTagAsync(Guid organizationId, Guid accountId, Guid tagId);
    }
}
