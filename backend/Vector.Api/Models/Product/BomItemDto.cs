using System;
using System.Collections.Generic;
using FluentValidation;

namespace Vector.Api.Models.Product
{
    public class BomItemDto
    {
        public Guid Id { get; set; }
        public Guid ComponentProductId { get; set; }
        public string ComponentProductCode { get; set; } = string.Empty;
        public string ComponentProductName { get; set; } = string.Empty;
        public string ComponentProductUnit { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BomTreeDto
    {
        public List<BomTreeNodeDto> Nodes { get; set; } = new();
        public List<BomTreeEdgeDto> Edges { get; set; } = new();
    }

    public class BomTreeNodeDto
    {
        public Guid Id { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string ProductUnit { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public bool IsRoot { get; set; }
    }

    public class BomTreeEdgeDto
    {
        public Guid Id { get; set; }
        public Guid SourceId { get; set; }
        public Guid TargetId { get; set; }
        public decimal Quantity { get; set; }
    }

    public class CreateBomItemRequest
    {
        public Guid ComponentProductId { get; set; }
        public decimal Quantity { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateBomItemRequest
    {
        public decimal Quantity { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateBomItemRequestValidator : AbstractValidator<CreateBomItemRequest>
    {
        public CreateBomItemRequestValidator()
        {
            RuleFor(x => x.ComponentProductId).NotEmpty();
            RuleFor(x => x.Quantity).GreaterThan(0);
        }
    }

    public class UpdateBomItemRequestValidator : AbstractValidator<UpdateBomItemRequest>
    {
        public UpdateBomItemRequestValidator()
        {
            RuleFor(x => x.Quantity).GreaterThan(0);
        }
    }
}
