namespace Vector.Api.Models.Profile
{
    public class SendPhoneVerificationRequest
    {
        public string CountryCode { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
