using Vector.Api.Data;
using Vector.Api.Entities.User;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Vector.Api.Services.Auth
{
    public interface ITokenService
    {
        string GenerateAccessToken(UserEntity user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
        Task<string> SaveRefreshTokenAsync(UserEntity user, ApplicationDbContext context);
    }
}
