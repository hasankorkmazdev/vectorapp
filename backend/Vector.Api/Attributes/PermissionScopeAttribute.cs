using System;

namespace Vector.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class PermissionScopeAttribute : Attribute
    {
        public string[] Scopes { get; }
        public PermissionScopeAttribute(params string[] scopes)
        {
            Scopes = scopes;
        }
    }
}
