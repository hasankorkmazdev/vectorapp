using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Entities;
using Vector.Api.Models.Customer;

namespace Vector.Api.Services.Customer
{
    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDbContext _context;

        public CustomerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<CustomerListDto> GetQueryable(Guid organizationId)
        {
            return _context.Customers
                .Where(c => c.OrganizationId == organizationId)
                .Select(c => new CustomerListDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    CompanyName = c.CompanyName,
                    TaxNumber = c.TaxNumber,
                    TaxOffice = c.TaxOffice,
                    Phone = c.Phone,
                    Email = c.Email,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                });
        }

        public async Task<CustomerDto?> GetByIdAsync(Guid organizationId, Guid id)
        {
            return await _context.Customers
                .Include(c => c.Contacts)
                .Include(c => c.Addresses)
                .Where(c => c.OrganizationId == organizationId && c.Id == id)
                .Select(c => new CustomerDto
                {
                    Id = c.Id,
                    CompanyName = c.CompanyName,
                    TaxNumber = c.TaxNumber,
                    TaxOffice = c.TaxOffice,
                    Code = c.Code,
                    Phone = c.Phone,
                    Email = c.Email,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Contacts = c.Contacts.Where(co => co.DeletedAt == null).Select(co => new CustomerContactDto
                    {
                        Id = co.Id,
                        FullName = co.FullName,
                        Title = co.Title,
                        Email = co.Email,
                        Phone = co.Phone,
                        Gsm = co.Gsm,
                        IsPrimary = co.IsPrimary
                    }).ToList(),
                    Addresses = c.Addresses.Where(a => a.DeletedAt == null).Select(a => new CustomerAddressDto
                    {
                        Id = a.Id,
                        Label = a.Label,
                        Country = a.Country,
                        City = a.City,
                        District = a.District,
                        PostalCode = a.PostalCode,
                        Address = a.Address,
                        IsPrimary = a.IsPrimary
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CustomerDto> CreateAsync(Guid organizationId, Guid userId, CreateCustomerRequest request)
        {
            var maxCode = await _context.Customers
                .Where(c => c.OrganizationId == organizationId)
                .MaxAsync(c => c.Code);

            var nextNumber = 1;
            if (maxCode != null && maxCode.StartsWith('C') && int.TryParse(maxCode[1..], out var lastNumber))
                nextNumber = lastNumber + 1;

            var entity = new CustomerEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Code = $"C{nextNumber:D4}",
                CompanyName = request.CompanyName,
                TaxNumber = request.TaxNumber,
                TaxOffice = request.TaxOffice,
                Phone = request.Phone,
                Email = request.Email,
                CreatedById = userId
            };

            _context.Customers.Add(entity);
            await _context.SaveChangesAsync();

            return new CustomerDto
            {
                Id = entity.Id,
                Code = entity.Code,
                CompanyName = entity.CompanyName,
                TaxNumber = entity.TaxNumber,
                TaxOffice = entity.TaxOffice,
                Phone = entity.Phone,
                Email = entity.Email,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        public async Task<CustomerDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateCustomerRequest request)
        {
            var entity = await _context.Customers
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.Id == id);

            if (entity == null) return null;

            entity.CompanyName = request.CompanyName;
            entity.TaxNumber = request.TaxNumber;
            entity.TaxOffice = request.TaxOffice;
            entity.Phone = request.Phone;
            entity.Email = request.Email;
            entity.UpdatedById = userId;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(organizationId, id);
        }

        public async Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id)
        {
            var entity = await _context.Customers
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.Id == id);

            if (entity == null) return false;

            _context.Customers.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // Contact operations

        public async Task<CustomerContactDto?> CreateContactAsync(Guid organizationId, Guid customerId, CreateContactRequest request)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.Id == customerId);

            if (customer == null) return null;

            var contact = new CustomerContactEntity
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                FullName = request.FullName,
                Title = request.Title,
                Email = request.Email,
                Phone = request.Phone,
                Gsm = request.Gsm,
                IsPrimary = request.IsPrimary
            };

            if (request.IsPrimary)
            {
                var existingPrimary = await _context.Set<CustomerContactEntity>()
                    .FirstOrDefaultAsync(co => co.CustomerId == customerId && co.IsPrimary && co.DeletedAt == null);
                if (existingPrimary != null)
                    existingPrimary.IsPrimary = false;
            }

            _context.Set<CustomerContactEntity>().Add(contact);
            await _context.SaveChangesAsync();

            return new CustomerContactDto
            {
                Id = contact.Id,
                FullName = contact.FullName,
                Title = contact.Title,
                Email = contact.Email,
                Phone = contact.Phone,
                Gsm = contact.Gsm,
                IsPrimary = contact.IsPrimary
            };
        }

        public async Task<CustomerContactDto?> UpdateContactAsync(Guid organizationId, Guid customerId, Guid contactId, UpdateContactRequest request)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.Id == customerId);

            if (customer == null) return null;

            var contact = await _context.Set<CustomerContactEntity>()
                .FirstOrDefaultAsync(co => co.Id == contactId && co.CustomerId == customerId && co.DeletedAt == null);

            if (contact == null) return null;

            contact.FullName = request.FullName;
            contact.Title = request.Title;
            contact.Email = request.Email;
            contact.Phone = request.Phone;
            contact.Gsm = request.Gsm;

            if (request.IsPrimary && !contact.IsPrimary)
            {
                var existingPrimary = await _context.Set<CustomerContactEntity>()
                    .FirstOrDefaultAsync(co => co.CustomerId == customerId && co.IsPrimary && co.Id != contactId && co.DeletedAt == null);
                if (existingPrimary != null)
                    existingPrimary.IsPrimary = false;
                contact.IsPrimary = true;
            }
            else if (!request.IsPrimary)
            {
                contact.IsPrimary = false;
            }

            await _context.SaveChangesAsync();

            return new CustomerContactDto
            {
                Id = contact.Id,
                FullName = contact.FullName,
                Title = contact.Title,
                Email = contact.Email,
                Phone = contact.Phone,
                Gsm = contact.Gsm,
                IsPrimary = contact.IsPrimary
            };
        }

        public async Task<bool> DeleteContactAsync(Guid organizationId, Guid customerId, Guid contactId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.Id == customerId);

            if (customer == null) return false;

            var contact = await _context.Set<CustomerContactEntity>()
                .FirstOrDefaultAsync(co => co.Id == contactId && co.CustomerId == customerId && co.DeletedAt == null);

            if (contact == null) return false;

            _context.Set<CustomerContactEntity>().Remove(contact);
            await _context.SaveChangesAsync();
            return true;
        }

        // Address operations

        public async Task<CustomerAddressDto?> CreateAddressAsync(Guid organizationId, Guid customerId, CreateAddressRequest request)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.Id == customerId);

            if (customer == null) return null;

            var address = new CustomerAddressEntity
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                Label = request.Label,
                Country = request.Country,
                City = request.City,
                District = request.District,
                PostalCode = request.PostalCode,
                Address = request.Address,
                IsPrimary = request.IsPrimary
            };

            if (request.IsPrimary)
            {
                var existingPrimary = await _context.Set<CustomerAddressEntity>()
                    .FirstOrDefaultAsync(a => a.CustomerId == customerId && a.IsPrimary && a.DeletedAt == null);
                if (existingPrimary != null)
                    existingPrimary.IsPrimary = false;
            }

            _context.Set<CustomerAddressEntity>().Add(address);
            await _context.SaveChangesAsync();

            return new CustomerAddressDto
            {
                Id = address.Id,
                Label = address.Label,
                Country = address.Country,
                City = address.City,
                District = address.District,
                PostalCode = address.PostalCode,
                Address = address.Address,
                IsPrimary = address.IsPrimary
            };
        }

        public async Task<CustomerAddressDto?> UpdateAddressAsync(Guid organizationId, Guid customerId, Guid addressId, UpdateAddressRequest request)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.Id == customerId);

            if (customer == null) return null;

            var address = await _context.Set<CustomerAddressEntity>()
                .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId && a.DeletedAt == null);

            if (address == null) return null;

            address.Label = request.Label;
            address.Country = request.Country;
            address.City = request.City;
            address.District = request.District;
            address.PostalCode = request.PostalCode;
            address.Address = request.Address;

            if (request.IsPrimary && !address.IsPrimary)
            {
                var existingPrimary = await _context.Set<CustomerAddressEntity>()
                    .FirstOrDefaultAsync(a => a.CustomerId == customerId && a.IsPrimary && a.Id != addressId && a.DeletedAt == null);
                if (existingPrimary != null)
                    existingPrimary.IsPrimary = false;
                address.IsPrimary = true;
            }
            else if (!request.IsPrimary)
            {
                address.IsPrimary = false;
            }

            await _context.SaveChangesAsync();

            return new CustomerAddressDto
            {
                Id = address.Id,
                Label = address.Label,
                Country = address.Country,
                City = address.City,
                District = address.District,
                PostalCode = address.PostalCode,
                Address = address.Address,
                IsPrimary = address.IsPrimary
            };
        }

        public async Task<bool> DeleteAddressAsync(Guid organizationId, Guid customerId, Guid addressId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.Id == customerId);

            if (customer == null) return false;

            var address = await _context.Set<CustomerAddressEntity>()
                .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId && a.DeletedAt == null);

            if (address == null) return false;

            _context.Set<CustomerAddressEntity>().Remove(address);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
