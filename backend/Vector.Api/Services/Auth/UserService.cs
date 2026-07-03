using Microsoft.EntityFrameworkCore;
using Vector.Api.Data;
using Vector.Api.Entities;
using Vector.Api.Models.Auth;
using Vector.Api.Models.Profile;
using Vector.Api.Services.Infrastructure;
using Google.Apis.Auth;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Vector.Api.Services.Auth
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMailService _mailService;
        private readonly IVerificationService _verificationService;
        private readonly IConfiguration _configuration;

        public UserService(
            ApplicationDbContext context,
            IMailService mailService,
            IVerificationService verificationService,
            IConfiguration configuration)
        {
            _context = context;
            _mailService = mailService;
            _verificationService = verificationService;
            _configuration = configuration;
        }

        public async Task<UserEntity?> GetByIdAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.OrganizationMembers)
                    .ThenInclude(om => om.Organization)
                .Include(u => u.OrganizationMembers)
                    .ThenInclude(om => om.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<UserEntity?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.OrganizationMembers)
                    .ThenInclude(om => om.Organization)
                .Include(u => u.OrganizationMembers)
                    .ThenInclude(om => om.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<UserEntity> RegisterAsync(RegisterRequest request)
        {
            // Check if email already exists
            var existingUser = await GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new Exception("Email address is already in use.");
            }

            var user = new UserEntity
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                IsEmailVerified = false,
                EmailVerificationToken = Guid.NewGuid().ToString()
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["AppUrls:Frontend"];
            var verificationLink = $"{frontendUrl}/verify-email?email={Uri.EscapeDataString(user.Email)}&token={user.EmailVerificationToken}";
            var emailBody = $@"
                <h3>Welcome to Vector!</h3>
                <p>Hello {user.FullName},</p>
                <p>Please click the link below to verify your email address and activate your account:</p>
                <p><a href='{verificationLink}'>Verify Email</a></p>
                <br/>
                <p>Best regards,<br/>Vector Team</p>";

            // Async mail send
            _ = Task.Run(() => _mailService.SendEmailAsync(user.Email, "Activate your Vector account", emailBody));

            return user;
        }

        public async Task<(UserEntity? User, string? ErrorMessage)> LoginAsync(LoginRequest request)
        {
            var user = await GetByEmailAsync(request.Email);
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return (null, "Invalid email or password.");
            }

            if (!user.IsEmailVerified)
            {
                return (null, "Please verify your email address before logging in.");
            }

            return (user, null);
        }

        public async Task<(UserEntity? User, string? ErrorMessage, string? Email, string? FullName)> LoginWithGoogleAsync(GoogleLoginRequest request)
        {
            try
            {
                var clientId = _configuration["Google:ClientId"];
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
                if (payload == null)
                {
                    return (null, "Invalid Google token.", null, null);
                }

                var user = await GetByEmailAsync(payload.Email);
                if (user == null)
                {
                    return (null, "USER_NOT_FOUND", payload.Email, payload.Name);
                }

                if (!user.IsEmailVerified)
                {
                    user.IsEmailVerified = true;
                    user.EmailVerificationToken = null;
                    await _context.SaveChangesAsync();
                }

                return (user, null, payload.Email, payload.Name);
            }
            catch (InvalidJwtException)
            {
                return (null, "Google token signature validation failed.", null, null);
            }
            catch (Exception ex)
            {
                return (null, $"Google login failed: {ex.Message}", null, null);
            }
        }

        public async Task<bool> VerifyEmailAsync(string email, string token)
        {
            var user = await GetByEmailAsync(email);
            if (user == null || user.EmailVerificationToken != token)
            {
                return false;
            }

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null; // Clear token
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RequestPasswordResetAsync(string email)
        {
            var user = await GetByEmailAsync(email);
            if (user == null)
            {
                return false; // For security, we might return true, but here we return false for simple api flow
            }

            user.PasswordResetToken = Guid.NewGuid().ToString();
            user.PasswordResetExpiresAt = DateTime.UtcNow.AddHours(2);
            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["AppUrls:Frontend"];
            var resetLink = $"{frontendUrl}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={user.PasswordResetToken}";
            var emailBody = $@"
                <h3>Reset your Password</h3>
                <p>Hello {user.FullName},</p>
                <p>You requested a password reset. Please click the link below to set a new password:</p>
                <p><a href='{resetLink}'>Reset Password</a></p>
                <p>This link will expire in 2 hours.</p>
                <br/>
                <p>Best regards,<br/>Vector Team</p>";

            _ = Task.Run(() => _mailService.SendEmailAsync(user.Email, "Reset your password", emailBody));

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await GetByEmailAsync(request.Email);
            if (user == null || user.PasswordResetToken != request.Token || user.PasswordResetExpiresAt < DateTime.UtcNow)
            {
                return false;
            }

            user.PasswordHash = HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetExpiresAt = null;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<UserEntity> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            if (request.FullName != null) user.FullName = request.FullName;

            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> RequestPhoneVerificationSmsAsync(Guid userId, string countryCode, string phoneNumber)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Strip non-digits
            var cleanCountry = new string(countryCode.Where(char.IsDigit).ToArray());
            var cleanPhone = new string(phoneNumber.Where(char.IsDigit).ToArray());

            // Build format 0{CountryCode}{Number}
            var formattedPhone = $"0{cleanCountry}{cleanPhone}";

            // Check if this phone number is already verified by another user
            var isPhoneUsed = await _context.Users.AnyAsync(u => u.PhoneNumber == formattedPhone && u.IsPhoneVerified && u.Id != userId);
            if (isPhoneUsed)
            {
                throw new Exception("This phone number is already verified by another account.");
            }

            user.PhoneNumber = formattedPhone;
            user.IsPhoneVerified = false; // Reset status on change
            await _context.SaveChangesAsync();

            // Send SMS via VerificationService
            await _verificationService.SendSmsCodeAsync(formattedPhone);
            return true;
        }

        public async Task<bool> VerifyPhoneAsync(Guid userId, string code)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.PhoneNumber)) return false;

            var isValid = await _verificationService.VerifySmsCodeAsync(user.PhoneNumber, code);
            if (isValid)
            {
                user.IsPhoneVerified = true;
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }



        public async Task<bool> ResendVerificationEmailAsync(string email)
        {
            var user = await GetByEmailAsync(email);
            if (user == null || user.IsEmailVerified)
            {
                // Return true to avoid email enumeration
                return true;
            }

            // Regenerate token
            user.EmailVerificationToken = Guid.NewGuid().ToString();
            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["AppUrls:Frontend"];
            var verificationLink = $"{frontendUrl}/verify-email?email={Uri.EscapeDataString(user.Email)}&token={user.EmailVerificationToken}";
            var emailBody = $@"
                <h3>Verify your email</h3>
                <p>Hello {user.FullName},</p>
                <p>Please click the link below to verify your email address and activate your account:</p>
                <p><a href='{verificationLink}'>Verify Email</a></p>
                <br/>
                <p>Best regards,<br/>Vector Team</p>";

            _ = Task.Run(() => _mailService.SendEmailAsync(user.Email, "Activate your Vector account", emailBody));
            return true;
        }

        // Simple helper methods for hashing (using SHA256)
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }
    }
}
