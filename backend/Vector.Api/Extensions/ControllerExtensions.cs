using Microsoft.AspNetCore.Mvc;
using Vector.Api.Entities;
using System;
using System.Threading.Tasks;

namespace Vector.Api.Extensions
{
    public static class ControllerExtensions
    {
        public static Guid GetUserId(this ControllerBase controller) => 
            controller.HttpContext.GetUserId();

        public static Guid GetOrganizationId(this ControllerBase controller) => 
            controller.HttpContext.GetOrganizationId();

        public static Task<UserEntity> GetCurrentUserAsync(this ControllerBase controller) => 
            controller.HttpContext.GetCurrentUserAsync();
    }
}
