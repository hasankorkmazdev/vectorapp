using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.OData;
using Microsoft.OData.ModelBuilder;
using System.Threading.RateLimiting;
using Vector.Api.Data;
using Vector.Api.Services.Auth;
using Vector.Api.Services.Infrastructure;
using Vector.Api.Services.Organization;
using Vector.Api.Services.Customer;
using Vector.Api.Models.Common;
using Vector.Api.Models.Customer;
using Vector.Api.Models.Auth;
using FluentValidation;
using System.Text;
using Vector.Api.Middlewares;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
ConfigureServices(builder);
var app = builder.Build();
ConfigurePipeline(app);
app.Run();

static void ConfigureServices(WebApplicationBuilder builder)
{
    var modelBuilder = new ODataConventionModelBuilder();
    modelBuilder.EntitySet<CustomerListDto>("Customers");

    var edmModel = modelBuilder.GetEdmModel();

    builder.Services.AddControllers()
        .AddOData(options => options
            .AddRouteComponents("api", edmModel)
            .EnableQueryFeatures(100));
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.Configure<ApiBehaviorOptions>(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = string.Join("; ", context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage));

            return new BadRequestObjectResult(Result.Failure(errors, 400));
        };
    });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddMemoryCache();
    builder.Services.AddHttpContextAccessor();

    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));

    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IMailService, MailService>();
    builder.Services.AddScoped<IVerificationService, VerificationService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<ICaptchaService, CaptchaService>();
    builder.Services.AddScoped<IOrganizationService, OrganizationService>();
    builder.Services.AddScoped<ICustomerService, CustomerService>();
    builder.Services.AddHttpClient();

    builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

    var jwtKey = builder.Configuration["Jwt:Key"]!;
    var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
    var jwtAudience = builder.Configuration["Jwt:Audience"]!;

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

    var allowedOrigins = builder.Configuration.GetSection("AppUrls:AllowedOrigins").Get<string[]>();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });

    builder.Services.AddOpenApi();

    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.AddFixedWindowLimiter("login", o =>
        {
            o.PermitLimit = 10;
            o.Window = TimeSpan.FromMinutes(1);
            o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            o.QueueLimit = 0;
        });
        options.AddFixedWindowLimiter("register", o =>
        {
            o.PermitLimit = 5;
            o.Window = TimeSpan.FromMinutes(5);
            o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            o.QueueLimit = 0;
        });
        options.AddFixedWindowLimiter("auth", o =>
        {
            o.PermitLimit = 5;
            o.Window = TimeSpan.FromMinutes(5);
            o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            o.QueueLimit = 0;
        });
    });
}

static void ConfigurePipeline(WebApplication app)
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;

        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
            DbInitializer.Seed(context);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
    app.UseHttpsRedirection();
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseCors("AllowFrontend");
    app.UseStaticFiles();

    app.UseRateLimiter();

    app.UseAuthentication();
    app.UseAuthorization();
    app.UseODataQueryRequest();
    app.UseMiddleware<OrganizationMiddleware>();
    app.UseMiddleware<PermissionMiddleware>();

    app.MapControllers();
}
