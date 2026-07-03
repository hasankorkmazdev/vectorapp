using System.Collections.Generic;

namespace Vector.Api.Models.Common
{
    public class UserAuthCache
    {
        public List<string> Roles { get; set; } = new();
        public List<string> Permissions { get; set; } = new();
    }
}
