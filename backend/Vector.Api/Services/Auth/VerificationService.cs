using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace Vector.Api.Services.Auth
{
    public class VerificationService : IVerificationService
    {
        private readonly ILogger<VerificationService> _logger;
        // Keep in-memory store for SMS codes
        private static readonly ConcurrentDictionary<string, string> SmsCodes = new();

        public VerificationService(ILogger<VerificationService> logger)
        {
            _logger = logger;
        }

        public Task<string> SendSmsCodeAsync(string phoneNumber)
        {
            var random = new Random();
            var code = random.Next(100000, 999999).ToString();
            
            SmsCodes[phoneNumber] = code;
            
            _logger.LogInformation("================================================");
            _logger.LogInformation("SMS SENT TO: {PhoneNumber}", phoneNumber);
            _logger.LogInformation("VERIFICATION CODE: {Code}", code);
            _logger.LogInformation("================================================");

            return Task.FromResult(code);
        }

        public Task<bool> VerifySmsCodeAsync(string phoneNumber, string code)
        {
            if (SmsCodes.TryGetValue(phoneNumber, out var savedCode) && savedCode == code)
            {
                SmsCodes.TryRemove(phoneNumber, out _);
                return Task.FromResult(true);
            }
            // For testing convenience, we also allow "123456" as a master code
            if (code == "123456")
            {
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
    }
}
