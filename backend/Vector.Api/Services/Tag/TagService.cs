using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Models.Tag;
using TagEntity = Vector.Api.Entities.Tag.TagEntity;

namespace Vector.Api.Services.Tag
{
    public class TagService : ITagService
    {
        private readonly ApplicationDbContext _context;

        public TagService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<TagDto> GetQueryable(Guid organizationId)
        {
            return _context.Tags
                .Where(t => t.OrganizationId == organizationId)
                .Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color
                });
        }

        public async Task<TagDto> CreateAsync(Guid organizationId, CreateTagRequest request)
        {
            var entity = new TagEntity
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Name = request.Name,
                Color = request.Color
            };

            _context.Tags.Add(entity);
            await _context.SaveChangesAsync();

            return new TagDto { Id = entity.Id, Name = entity.Name, Color = entity.Color };
        }

        public async Task<TagDto?> UpdateAsync(Guid organizationId, Guid id, UpdateTagRequest request)
        {
            var entity = await _context.Tags
                .FirstOrDefaultAsync(t => t.OrganizationId == organizationId && t.Id == id);

            if (entity == null) return null;

            entity.Name = request.Name;
            entity.Color = request.Color;

            await _context.SaveChangesAsync();

            return new TagDto { Id = entity.Id, Name = entity.Name, Color = entity.Color };
        }

        public async Task<bool> DeleteAsync(Guid organizationId, Guid id)
        {
            var entity = await _context.Tags
                .FirstOrDefaultAsync(t => t.OrganizationId == organizationId && t.Id == id);

            if (entity == null) return false;

            _context.Tags.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
