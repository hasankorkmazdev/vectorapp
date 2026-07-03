using System.Threading.Tasks;

namespace Vector.Api.Services.Infrastructure
{
    public interface IMailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}
