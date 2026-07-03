using FluentValidation;
using System;

namespace Vector.Api.Models.Profile
{
    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
    }

    public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
    {
        public UpdateProfileRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty().When(x => x.FullName != null);
        }
    }
}
