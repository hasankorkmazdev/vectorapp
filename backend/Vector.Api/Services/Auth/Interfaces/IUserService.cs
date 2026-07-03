using System;
using System.Threading.Tasks;
using Vector.Api.Entities;
using Vector.Api.Models.Auth;
using Vector.Api.Models.Profile;

namespace Vector.Api.Services.Auth
{
    public interface IUserService
    {
        Task<UserEntity?> GetByIdAsync(Guid id);
        Task<UserEntity?> GetByEmailAsync(string email);
        Task<UserEntity> RegisterAsync(RegisterRequest request);
        Task<(UserEntity? User, string? ErrorMessage)> LoginAsync(LoginRequest request);
        Task<(UserEntity? User, string? ErrorMessage, string? Email, string? FullName)> LoginWithGoogleAsync(GoogleLoginRequest request);
        Task<bool> VerifyEmailAsync(string email, string token);
        Task<bool> RequestPasswordResetAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordRequest request);
        Task<UserEntity> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
        Task<bool> RequestPhoneVerificationSmsAsync(Guid userId, string countryCode, string phoneNumber);
        Task<bool> VerifyPhoneAsync(Guid userId, string code);
        Task<bool> ResendVerificationEmailAsync(string email);
    }
}
