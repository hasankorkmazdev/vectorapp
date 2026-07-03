using System;
using System.Threading.Tasks;

namespace Vector.Api.Services.Auth
{
    public interface IVerificationService
    {
        Task<string> SendSmsCodeAsync(string phoneNumber);
        Task<bool> VerifySmsCodeAsync(string phoneNumber, string code);
    }
}
