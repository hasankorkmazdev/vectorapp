namespace Vector.Api.Models.Auth
{
    public class ResendVerificationRequest
    {
        public string Email { get; set; } = string.Empty;
        public string CaptchaToken { get; set; } = string.Empty;
    }
}
