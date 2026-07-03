using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Vector.Api.Entities;
using Vector.Api.Models.Organization;

namespace Vector.Api.Services.Organization
{
    public interface IOrganizationService
    {
        Task<bool> IsMemberAsync(Guid userId, Guid orgId);
        Task<string> GetDefaultLanguageAsync(Guid orgId);
        Task<OrganizationEntity> CreateAsync(UserEntity user, CreateOrganizationRequest request);
        Task<(bool success, string? error)> CompleteSetupAsync(Guid userId, Guid orgId, CompleteSetupRequest request);
        Task<List<OrganizationDto>> GetUserOrganizationsAsync(Guid userId);
        Task<(OrganizationDetailsResponse? result, string? error)> GetDetailsAsync(Guid userId, Guid orgId);
        Task<(OrganizationSettingsDto? result, string? error)> GetSettingsAsync(Guid userId, Guid orgId);
        Task<(bool success, string? error)> UpdateSettingsAsync(Guid userId, Guid orgId, UpdateOrganizationSettingsRequest request);
    }
}
