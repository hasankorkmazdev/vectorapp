using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Vector.Api.Attributes;
using Vector.Api.Extensions;
using Vector.Api.Models.Common;
using Vector.Api.Models.Tag;
using Vector.Api.Services.Tag;
using System;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TagController : ControllerBase
    {
        private readonly ITagService _tagService;

        public TagController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        [RequiresOrganization]
        [EnableQuery(PageSize = 100)]
        public IQueryable<TagDto> GetAll()
        {
            var orgId = this.GetOrganizationId();
            return _tagService.GetQueryable(orgId);
        }

        [HttpPost]
        [RequiresOrganization]
        public async Task<IActionResult> Create([FromBody] CreateTagRequest request)
        {
            var orgId = this.GetOrganizationId();
            var tag = await _tagService.CreateAsync(orgId, request);
            return Ok(Result<TagDto>.Success(tag, "Tag created successfully.", 201));
        }

        [HttpPut("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTagRequest request)
        {
            var orgId = this.GetOrganizationId();
            var tag = await _tagService.UpdateAsync(orgId, id, request);
            if (tag == null)
                return NotFound(Result.Failure("Tag not found.", 404));
            return Ok(Result<TagDto>.Success(tag, "Tag updated successfully."));
        }

        [HttpDelete("{id}")]
        [RequiresOrganization]
        public async Task<IActionResult> Delete(Guid id)
        {
            var orgId = this.GetOrganizationId();
            var deleted = await _tagService.DeleteAsync(orgId, id);
            if (!deleted)
                return NotFound(Result.Failure("Tag not found.", 404));
            return Ok(Result.Success("Tag deleted successfully."));
        }
    }
}
