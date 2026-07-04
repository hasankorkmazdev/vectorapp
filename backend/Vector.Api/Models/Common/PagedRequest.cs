using System.Collections.Generic;

namespace Vector.Api.Models.Common
{
    public class PagedRequest
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } = "asc";
        public List<FilterRequest>? Filters { get; set; }
    }

    public class FilterRequest
    {
        public string Field { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
