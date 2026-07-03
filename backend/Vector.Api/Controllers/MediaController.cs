using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vector.Api.Data;
using Vector.Api.Extensions;
using Vector.Api.Models.Common;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Vector.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public MediaController(ApplicationDbContext dbContext, IWebHostEnvironment webHostEnvironment)
        {
            _dbContext = dbContext;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(Result.Failure("No file was uploaded.", 400));
            }

            // Allowed extensions check
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (Array.IndexOf(allowedExtensions, extension) < 0)
            {
                return BadRequest(Result.Failure("Only JPG, JPEG, PNG, and WEBP formats are allowed.", 400));
            }

            // File size check (e.g. max 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(Result.Failure("File size cannot exceed 5MB.", 400));
            }

            try
            {
                // Get Organization Id from request context
                var orgId = HttpContext.GetOrganizationId();
                var org = await _dbContext.Organizations.FindAsync(orgId);
                if (org == null)
                {
                    return BadRequest(Result.Failure("Organization not found.", 404));
                }

                // Sanitize organization name for folder usage
                var cleanName = org.Name;
                foreach (var c in Path.GetInvalidFileNameChars())
                {
                    cleanName = cleanName.Replace(c.ToString(), "");
                }
                cleanName = cleanName.Replace(" ", "").Replace("-", "").Replace("_", "");
                if (string.IsNullOrWhiteSpace(cleanName))
                {
                    cleanName = "tenant";
                }

                var folderName = $"{cleanName}{orgId}";

                // Ensure uploads folder and tenant-specific folder exist in web root path
                var rootPath = _webHostEnvironment.WebRootPath ?? Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");
                var uploadsFolder = Path.Combine(rootPath, "uploads", folderName);
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/{folderName}/{uniqueFileName}";

                return Ok(Result.Success("File uploaded successfully.", 200, new { imageUrl = fileUrl }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result.Failure($"Failed to save file: {ex.Message}", 500));
            }
        }
    }
}
