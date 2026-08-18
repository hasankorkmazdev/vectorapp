using System;
using System.Linq;
using System.Threading.Tasks;
using Vector.Api.Models.Tag;

namespace Vector.Api.Services.Tag
{
    public interface ITagService
    {
        IQueryable<TagDto> GetQueryable(Guid organizationId);
        Task<TagDto> CreateAsync(Guid organizationId, CreateTagRequest request);
        Task<TagDto?> UpdateAsync(Guid organizationId, Guid id, UpdateTagRequest request);
        Task<bool> DeleteAsync(Guid organizationId, Guid id);
    }
}
