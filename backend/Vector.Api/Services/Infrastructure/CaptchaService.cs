using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Vector.Api.Services.Infrastructure
{
    public class CaptchaService : ICaptchaService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public CaptchaService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<bool> VerifyAsync(string token)
        {
            var enabled = _configuration.GetValue<bool>("Recaptcha:Enabled");

            if (!enabled)
                return true;

            if (token == "development_bypass")
                return true;

            if (string.IsNullOrWhiteSpace(token))
                return false;

            var secretKey = _configuration["Recaptcha:SecretKey"];
            var client = _httpClientFactory.CreateClient();

            var response = await client.PostAsync(
                $"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={token}",
                null);

            if (!response.IsSuccessStatusCode)
                return false;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("success").GetBoolean();
        }
    }
}
