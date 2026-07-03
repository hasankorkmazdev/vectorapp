using FluentValidation;

namespace Vector.Api.Models.Auth
{
    public class GoogleLoginRequest
    {
        public string IdToken { get; set; } = string.Empty;
        public string Role { get; set; } = "Member";
    }

    public class GoogleLoginRequestValidator : AbstractValidator<GoogleLoginRequest>
    {
        public GoogleLoginRequestValidator()
        {
            RuleFor(x => x.IdToken).NotEmpty();
            RuleFor(x => x.Role).NotEmpty();
        }
    }
}
