using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Vector.Api.Attributes;
using System;
using System.Threading.Tasks;

namespace Vector.Api.Middlewares
{
    public class OrganizationMiddleware
    {
        private readonly RequestDelegate _next;

        public OrganizationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var endpoint = context.GetEndpoint();
            if (endpoint == null)
            {
                await _next(context);
                return;
            }

            if (endpoint.Metadata.GetMetadata<IAllowAnonymous>() != null)
            {
                await _next(context);
                return;
            }

            var requiresOrg = endpoint.Metadata.GetMetadata<RequiresOrganizationAttribute>();
            if (requiresOrg == null)
            {
                await _next(context);
                return;
            }

            if (!context.Request.Headers.TryGetValue("X-Organization-Id", out var orgIdStr) ||
                !Guid.TryParse(orgIdStr, out var organizationId))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { message = "X-Organization-Id header is missing or invalid." });
                return;
            }

            context.Items["OrganizationId"] = organizationId;

            await _next(context);
        }
    }
}
