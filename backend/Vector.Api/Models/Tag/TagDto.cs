using System;

namespace Vector.Api.Models.Tag
{
    public class TagDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
    }
}
