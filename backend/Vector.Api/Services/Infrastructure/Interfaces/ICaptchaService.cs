using System.Threading.Tasks;

namespace Vector.Api.Services.Infrastructure
{
    public interface ICaptchaService
    {
        Task<bool> VerifyAsync(string token);
    }
}
