using System;

namespace Vector.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequiresOrganizationAttribute : Attribute { }
}
