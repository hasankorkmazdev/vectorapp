using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.Customer;

namespace Vector.Api.Services.Customer
{
    public interface ICustomerService
    {
        IQueryable<CustomerListDto> GetQueryable(Guid organizationId);
        Task<CustomerDto?> GetByIdAsync(Guid organizationId, Guid id);
        Task<CustomerDto> CreateAsync(Guid organizationId, Guid userId, CreateCustomerRequest request);
        Task<CustomerDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateCustomerRequest request);
        Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id);

        Task<CustomerContactDto?> CreateContactAsync(Guid organizationId, Guid customerId, CreateContactRequest request);
        Task<CustomerContactDto?> UpdateContactAsync(Guid organizationId, Guid customerId, Guid contactId, UpdateContactRequest request);
        Task<bool> DeleteContactAsync(Guid organizationId, Guid customerId, Guid contactId);

        Task<CustomerAddressDto?> CreateAddressAsync(Guid organizationId, Guid customerId, CreateAddressRequest request);
        Task<CustomerAddressDto?> UpdateAddressAsync(Guid organizationId, Guid customerId, Guid addressId, UpdateAddressRequest request);
        Task<bool> DeleteAddressAsync(Guid organizationId, Guid customerId, Guid addressId);
    }
}
