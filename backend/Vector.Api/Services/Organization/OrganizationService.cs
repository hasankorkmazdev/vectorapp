using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Entities;
using Vector.Api.Models.Organization;

namespace Vector.Api.Services.Organization
{
    public class OrganizationService : IOrganizationService
    {
        private readonly ApplicationDbContext _context;

        public OrganizationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsMemberAsync(Guid userId, Guid orgId)
        {
            return await _context.OrganizationMembers
                .AnyAsync(om => om.UserId == userId && om.OrganizationId == orgId);
        }

        public async Task<string> GetDefaultLanguageAsync(Guid orgId)
        {
            return (await _context.Organizations
                .Where(o => o.Id == orgId)
                .Select(o => o.DefaultLanguage)
                .FirstOrDefaultAsync());
        }

        public async Task<OrganizationEntity> CreateAsync(UserEntity user, CreateOrganizationRequest request)
        {
            var organization = new OrganizationEntity
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                TaxNumber = request.TaxNumber,
                TaxOffice = request.TaxOffice,
                Address = request.Address,
                IsSetupRequired = false,
                CreatedAt = DateTime.UtcNow
            };

            var ownerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Owner");
            if (ownerRole == null)
            {
                ownerRole = new RoleEntity { Id = Guid.NewGuid(), Name = "Owner" };
                _context.Roles.Add(ownerRole);
            }

            var membership = new OrganizationMemberEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organization.Id,
                UserId = user.Id,
                RoleId = ownerRole.Id,
                CreatedAt = DateTime.UtcNow
            };

            _context.Organizations.Add(organization);
            _context.OrganizationMembers.Add(membership);
            await _context.SaveChangesAsync();

            return organization;
        }

        public async Task<(bool success, string? error)> CompleteSetupAsync(Guid userId, Guid orgId, CompleteSetupRequest request)
        {
            var organization = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == orgId);
            if (organization == null)
                return (false, "Organization not found.");

            var isMember = await IsMemberAsync(userId, orgId);
            if (!isMember)
                return (false, "User is not a member of this organization.");

            if (!organization.IsSetupRequired)
                return (false, "Organization setup is already completed.");

            organization.Name = request.Name;
            organization.TaxNumber = request.TaxNumber;
            organization.TaxOffice = request.TaxOffice;
            organization.Address = request.Address;
            organization.SupportedLanguages = request.SupportedLanguages.Select(l => l.ToLower().Trim()).ToList();
            organization.DefaultLanguage = request.DefaultLanguage.ToLower().Trim();
            organization.PriceVariesByLanguage = request.PriceVariesByLanguage;
            organization.IsSetupRequired = false;

            await _context.SaveChangesAsync();
            return (true, null);
        }

        public async Task<List<OrganizationDto>> GetUserOrganizationsAsync(Guid userId)
        {
            var memberships = await _context.OrganizationMembers
                .Include(om => om.Organization)
                .Include(om => om.Role)
                .Where(om => om.UserId == userId)
                .ToListAsync();

            return memberships.Select(om => new OrganizationDto
            {
                Id = om.OrganizationId,
                Name = om.Organization?.Name ?? string.Empty,
                RoleName = om.Role?.Name ?? string.Empty,
                IsSetupRequired = om.Organization?.IsSetupRequired ?? false,
                SupportedLanguages = om.Organization!.SupportedLanguages,
                DefaultLanguage = om.Organization!.DefaultLanguage
            }).ToList();
        }

        public async Task<(OrganizationDetailsResponse? result, string? error)> GetDetailsAsync(Guid userId, Guid orgId)
        {
            var isMember = await IsMemberAsync(userId, orgId);
            if (!isMember)
                return (null, "User is not a member of this organization.");

            var organization = await _context.Organizations
                .Include(o => o.Members).ThenInclude(m => m.User)
                .Include(o => o.Members).ThenInclude(m => m.Role)
                .FirstOrDefaultAsync(o => o.Id == orgId);

            if (organization == null)
                return (null, "Organization not found.");

            var response = new OrganizationDetailsResponse
            {
                Id = organization.Id,
                Name = organization.Name,
                TaxNumber = organization.TaxNumber,
                TaxOffice = organization.TaxOffice,
                Address = organization.Address,
                IsSetupRequired = organization.IsSetupRequired,
                SupportedLanguages = organization.SupportedLanguages,
                DefaultLanguage = organization.DefaultLanguage,
                PriceVariesByLanguage = organization.PriceVariesByLanguage,
                Members = organization.Members.Select(m => new OrganizationMemberDto
                {
                    Id = m.User?.Id ?? Guid.Empty,
                    FullName = m.User?.FullName ?? string.Empty,
                    Email = m.User?.Email ?? string.Empty,
                    Role = string.Empty,
                    OrganizationRole = m.Role?.Name
                }).ToList()
            };

            return (response, null);
        }

        public async Task<(OrganizationSettingsDto? result, string? error)> GetSettingsAsync(Guid userId, Guid orgId)
        {
            var isMember = await IsMemberAsync(userId, orgId);
            if (!isMember)
                return (null, "User is not a member of this organization.");

            var organization = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == orgId);
            if (organization == null)
                return (null, "Organization not found.");

            return (new OrganizationSettingsDto
            {
                SupportedLanguages = organization.SupportedLanguages,
                DefaultLanguage = organization.DefaultLanguage,
                PriceVariesByLanguage = organization.PriceVariesByLanguage,
            }, null);
        }

        public async Task<(bool success, string? error)> UpdateSettingsAsync(Guid userId, Guid orgId, UpdateOrganizationSettingsRequest request)
        {
            var membership = await _context.OrganizationMembers
                .Include(om => om.Role)
                .FirstOrDefaultAsync(om => om.UserId == userId && om.OrganizationId == orgId);

            if (membership == null)
                return (false, "User is not a member of this organization.");

            if (membership.Role?.Name != "Owner" && membership.Role?.Name != "Admin")
                return (false, "Only owners or administrators can edit settings.");

            var organization = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == orgId);
            if (organization == null)
                return (false, "Organization not found.");

            organization.SupportedLanguages = request.SupportedLanguages.Select(l => l.ToLower().Trim()).ToList();
            organization.DefaultLanguage = request.DefaultLanguage.ToLower().Trim();
            organization.PriceVariesByLanguage = request.PriceVariesByLanguage;

            await _context.SaveChangesAsync();
            return (true, null);
        }
    }
}
