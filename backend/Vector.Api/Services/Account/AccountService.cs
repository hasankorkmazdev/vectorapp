using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using AccountEntities = Vector.Api.Entities.Account;
using Vector.Api.Models.Account;
using Vector.Api.Models.Tag;

namespace Vector.Api.Services.Account
{
    public class AccountService : IAccountService
    {
        private const string CustomerTagName = "Müşteri";
        private const string SupplierTagName = "Tedarikçi";

        private readonly ApplicationDbContext _context;

        public AccountService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<AccountListDto> GetQueryable(Guid organizationId)
        {
            return _context.Accounts
                .Where(a => a.OrganizationId == organizationId)
                .Select(a => new AccountListDto
                {
                    Id = a.Id,
                    Code = a.Code,
                    CompanyName = a.CompanyName,
                    TaxNumber = a.TaxNumber,
                    TaxOffice = a.TaxOffice,
                    Phone = a.Phone,
                    Email = a.Email,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    Tags = a.AccountTags.Select(at => new TagDto
                    {
                        Id = at.Tag!.Id,
                        Name = at.Tag.Name,
                        Color = at.Tag.Color
                    }).ToList()
                });
        }

        public async Task<AccountDto?> GetByIdAsync(Guid organizationId, Guid id)
        {
            return await _context.Accounts
                .Include(a => a.Contacts)
                .Include(a => a.Addresses)
                .Include(a => a.AccountTags).ThenInclude(at => at.Tag)
                .Where(a => a.OrganizationId == organizationId && a.Id == id)
                .Select(a => new AccountDto
                {
                    Id = a.Id,
                    CompanyName = a.CompanyName,
                    TaxNumber = a.TaxNumber,
                    TaxOffice = a.TaxOffice,
                    Code = a.Code,
                    Phone = a.Phone,
                    Email = a.Email,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    Contacts = a.Contacts.Where(co => co.DeletedAt == null).Select(co => new AccountContactDto
                    {
                        Id = co.Id,
                        FullName = co.FullName,
                        Title = co.Title,
                        Email = co.Email,
                        Phone = co.Phone,
                        Gsm = co.Gsm,
                        IsPrimary = co.IsPrimary
                    }).ToList(),
                    Addresses = a.Addresses.Where(ad => ad.DeletedAt == null).Select(ad => new AccountAddressDto
                    {
                        Id = ad.Id,
                        Label = ad.Label,
                        Country = ad.Country,
                        City = ad.City,
                        District = ad.District,
                        PostalCode = ad.PostalCode,
                        Address = ad.Address,
                        IsPrimary = ad.IsPrimary
                    }).ToList(),
                    Tags = a.AccountTags.Select(at => new TagDto
                    {
                        Id = at.Tag!.Id,
                        Name = at.Tag.Name,
                        Color = at.Tag.Color
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        private async Task<string> GenerateCodeAsync(Guid organizationId, List<Guid> tagIds)
        {
            var prefix = "A";

            if (tagIds.Count == 1)
            {
                var tagName = await _context.Tags
                    .Where(t => t.OrganizationId == organizationId && t.Id == tagIds[0])
                    .Select(t => t.Name)
                    .FirstOrDefaultAsync();

                if (tagName == CustomerTagName) prefix = "C";
                else if (tagName == SupplierTagName) prefix = "S";
            }

            var maxCode = await _context.Accounts
                .Where(a => a.OrganizationId == organizationId && a.Code.StartsWith(prefix))
                .MaxAsync(a => (string?)a.Code);

            var nextNumber = 1;
            if (maxCode != null && int.TryParse(maxCode[1..], out var lastNumber))
                nextNumber = lastNumber + 1;

            return $"{prefix}{nextNumber:D4}";
        }

        public async Task<AccountDto> CreateAsync(Guid organizationId, Guid userId, CreateAccountRequest request)
        {
            var tagIds = request.TagIds ?? new List<Guid>();
            var code = await GenerateCodeAsync(organizationId, tagIds);

            var entity = new AccountEntities.AccountEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Code = code,
                CompanyName = request.CompanyName,
                TaxNumber = request.TaxNumber,
                TaxOffice = request.TaxOffice,
                Phone = request.Phone,
                Email = request.Email,
                CreatedById = userId
            };

            foreach (var tagId in tagIds.Distinct())
            {
                entity.AccountTags.Add(new AccountEntities.AccountTagEntity { AccountId = entity.Id, TagId = tagId });
            }

            _context.Accounts.Add(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(organizationId, entity.Id) ?? new AccountDto
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

        public async Task<AccountDto?> UpdateAsync(Guid organizationId, Guid userId, Guid id, UpdateAccountRequest request)
        {
            var entity = await _context.Accounts
                .Include(a => a.AccountTags)
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == id);

            if (entity == null) return null;

            entity.CompanyName = request.CompanyName;
            entity.TaxNumber = request.TaxNumber;
            entity.TaxOffice = request.TaxOffice;
            entity.Phone = request.Phone;
            entity.Email = request.Email;
            entity.UpdatedById = userId;

            if (request.TagIds != null)
            {
                var newTagIds = request.TagIds.Distinct().ToHashSet();
                entity.AccountTags.RemoveAll(at => !newTagIds.Contains(at.TagId));
                var existingTagIds = entity.AccountTags.Select(at => at.TagId).ToHashSet();
                foreach (var tagId in newTagIds.Where(t => !existingTagIds.Contains(t)))
                {
                    entity.AccountTags.Add(new AccountEntities.AccountTagEntity { AccountId = entity.Id, TagId = tagId });
                }
            }

            await _context.SaveChangesAsync();

            return await GetByIdAsync(organizationId, id);
        }

        public async Task<bool> DeleteAsync(Guid organizationId, Guid userId, Guid id)
        {
            var entity = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == id);

            if (entity == null) return false;

            _context.Accounts.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // Contact operations

        public async Task<AccountContactDto?> CreateContactAsync(Guid organizationId, Guid accountId, CreateContactRequest request)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == accountId);

            if (account == null) return null;

            var contact = new AccountEntities.AccountContactEntity
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                FullName = request.FullName,
                Title = request.Title,
                Email = request.Email,
                Phone = request.Phone,
                Gsm = request.Gsm,
                IsPrimary = request.IsPrimary
            };

            if (request.IsPrimary)
            {
                var existingPrimary = await _context.Set<AccountEntities.AccountContactEntity>()
                    .FirstOrDefaultAsync(co => co.AccountId == accountId && co.IsPrimary && co.DeletedAt == null);
                if (existingPrimary != null)
                    existingPrimary.IsPrimary = false;
            }

            _context.Set<AccountEntities.AccountContactEntity>().Add(contact);
            await _context.SaveChangesAsync();

            return new AccountContactDto
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

        public async Task<AccountContactDto?> UpdateContactAsync(Guid organizationId, Guid accountId, Guid contactId, UpdateContactRequest request)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == accountId);

            if (account == null) return null;

            var contact = await _context.Set<AccountEntities.AccountContactEntity>()
                .FirstOrDefaultAsync(co => co.Id == contactId && co.AccountId == accountId && co.DeletedAt == null);

            if (contact == null) return null;

            contact.FullName = request.FullName;
            contact.Title = request.Title;
            contact.Email = request.Email;
            contact.Phone = request.Phone;
            contact.Gsm = request.Gsm;

            if (request.IsPrimary && !contact.IsPrimary)
            {
                var existingPrimary = await _context.Set<AccountEntities.AccountContactEntity>()
                    .FirstOrDefaultAsync(co => co.AccountId == accountId && co.IsPrimary && co.Id != contactId && co.DeletedAt == null);
                if (existingPrimary != null)
                    existingPrimary.IsPrimary = false;
                contact.IsPrimary = true;
            }
            else if (!request.IsPrimary)
            {
                contact.IsPrimary = false;
            }

            await _context.SaveChangesAsync();

            return new AccountContactDto
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

        public async Task<bool> DeleteContactAsync(Guid organizationId, Guid accountId, Guid contactId)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == accountId);

            if (account == null) return false;

            var contact = await _context.Set<AccountEntities.AccountContactEntity>()
                .FirstOrDefaultAsync(co => co.Id == contactId && co.AccountId == accountId && co.DeletedAt == null);

            if (contact == null) return false;

            _context.Set<AccountEntities.AccountContactEntity>().Remove(contact);
            await _context.SaveChangesAsync();
            return true;
        }

        // Address operations

        public async Task<AccountAddressDto?> CreateAddressAsync(Guid organizationId, Guid accountId, CreateAddressRequest request)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == accountId);

            if (account == null) return null;

            var address = new AccountEntities.AccountAddressEntity
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
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
                var existingPrimary = await _context.Set<AccountEntities.AccountAddressEntity>()
                    .FirstOrDefaultAsync(ad => ad.AccountId == accountId && ad.IsPrimary && ad.DeletedAt == null);
                if (existingPrimary != null)
                    existingPrimary.IsPrimary = false;
            }

            _context.Set<AccountEntities.AccountAddressEntity>().Add(address);
            await _context.SaveChangesAsync();

            return new AccountAddressDto
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

        public async Task<AccountAddressDto?> UpdateAddressAsync(Guid organizationId, Guid accountId, Guid addressId, UpdateAddressRequest request)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == accountId);

            if (account == null) return null;

            var address = await _context.Set<AccountEntities.AccountAddressEntity>()
                .FirstOrDefaultAsync(ad => ad.Id == addressId && ad.AccountId == accountId && ad.DeletedAt == null);

            if (address == null) return null;

            address.Label = request.Label;
            address.Country = request.Country;
            address.City = request.City;
            address.District = request.District;
            address.PostalCode = request.PostalCode;
            address.Address = request.Address;

            if (request.IsPrimary && !address.IsPrimary)
            {
                var existingPrimary = await _context.Set<AccountEntities.AccountAddressEntity>()
                    .FirstOrDefaultAsync(ad => ad.AccountId == accountId && ad.IsPrimary && ad.Id != addressId && ad.DeletedAt == null);
                if (existingPrimary != null)
                    existingPrimary.IsPrimary = false;
                address.IsPrimary = true;
            }
            else if (!request.IsPrimary)
            {
                address.IsPrimary = false;
            }

            await _context.SaveChangesAsync();

            return new AccountAddressDto
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

        public async Task<bool> DeleteAddressAsync(Guid organizationId, Guid accountId, Guid addressId)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == accountId);

            if (account == null) return false;

            var address = await _context.Set<AccountEntities.AccountAddressEntity>()
                .FirstOrDefaultAsync(ad => ad.Id == addressId && ad.AccountId == accountId && ad.DeletedAt == null);

            if (address == null) return false;

            _context.Set<AccountEntities.AccountAddressEntity>().Remove(address);
            await _context.SaveChangesAsync();
            return true;
        }

        // Tag operations

        public async Task<bool> AssignTagAsync(Guid organizationId, Guid accountId, Guid tagId)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == accountId);
            if (account == null) return false;

            var tag = await _context.Tags
                .FirstOrDefaultAsync(t => t.OrganizationId == organizationId && t.Id == tagId);
            if (tag == null) return false;

            var exists = await _context.AccountTagLinks
                .AnyAsync(at => at.AccountId == accountId && at.TagId == tagId);
            if (exists) return true;

            _context.AccountTagLinks.Add(new AccountEntities.AccountTagEntity { AccountId = accountId, TagId = tagId });
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveTagAsync(Guid organizationId, Guid accountId, Guid tagId)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.OrganizationId == organizationId && a.Id == accountId);
            if (account == null) return false;

            var link = await _context.AccountTagLinks
                .FirstOrDefaultAsync(at => at.AccountId == accountId && at.TagId == tagId);
            if (link == null) return false;

            _context.AccountTagLinks.Remove(link);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
