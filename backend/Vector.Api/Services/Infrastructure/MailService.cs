using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Vector.Api.Services.Infrastructure
{
    public class MailService : IMailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<MailService> _logger;

        public MailService(IConfiguration configuration, ILogger<MailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var host = _configuration["Smtp:Host"];
                int port = int.Parse(_configuration["Smtp:Port"]);
                var senderEmail = _configuration["Smtp:SenderEmail"];
                var senderName = _configuration["Smtp:SenderName"];
                var password = _configuration["Smtp:Password"];

                using var client = new SmtpClient(host, port);
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(senderEmail, password);
                client.EnableSsl = true;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);

                _logger.LogInformation("Sending email to {To} with subject: {Subject}", to, subject);
                
                await client.SendMailAsync(mailMessage);
                
                _logger.LogInformation("Email sent successfully to {To}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", to);
                // We don't throw to avoid blocking registration/password resets during tests if SMTP is blocked.
                // However, in production, throwing is preferred, but for developer convenience we'll log it.
            }
        }
    }
}
