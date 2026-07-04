# Vector

## Monorepo layout

- `backend/Vector.Api.sln` — .NET 10 ASP.NET Core Web API (C#, EF Core, Npgsql PostgreSQL)
- `frontend/` — Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui

## Backend commands

```powershell
# Build (from backend/)
dotnet build

# DB is rebuilt via EnsureCreated() at startup — no migration workflow.
# Only add EF tool migration commands when explicitly asked.
```

## Frontend commands

```powershell
# Install (react-device-frameset has a React 19 peer dep conflict)
npm install --legacy-peer-deps

# Dev server on port 8080
npm run dev

# Full build (tsc -b && vite build)
npm run build

# Lint only
npm run lint
```

## Architecture

### Multi-tenant auth
- Every API request includes `X-Organization-Id` header (set by frontend axios interceptor).
- `OrganizationMiddleware` resolves org from header, sets `HttpContext.Items["OrganizationId"]`.
- `PermissionMiddleware` enforces RBAC using cached user permissions.
- JWT access tokens + refresh tokens (HttpOnly cookie) via `/auth/refresh-token`.

### API response envelope
All endpoints return `Result<T>` with `{ Code: int, Data: T | null, Error: bool, Message: string }`.

### Folder conventions

```
Models/
  Auth/          — LoginRequest, RegisterRequest, etc.
  Profile/       — UpdateProfileRequest, etc.
  Organization/  — OrganizationModels, RoleModel
  Common/        — Result<T>, UserAuthCache

Services/
  Auth/
    Interfaces/     — IUserService, ITokenService, IVerificationService
    UserService.cs, TokenService.cs, VerificationService.cs
  Organization/
    Interfaces/     — IOrganizationService
    OrganizationService.cs
  Infrastructure/
    Interfaces/     — IMailService, ICaptchaService
    MailService.cs, CaptchaService.cs
```

### Rules (`.agents/rules/`)
1. **No `record`** keyword in backend.
2. **FluentValidation** in the same file as the model class.
   **Her model kendi dosyasında** — birden fazla model aynı dosyada olmaz. Model + validatörü aynı dosyada kalır ama başka bir model o dosyaya girmez.
3. **All API messages in English.** Use FluentValidation's default messages when possible.
4. **No magic strings** in frontend — always use i18n locale files (`src/i18n/locales/{en,tr}/`).
5. **Use shadcn/ui components** (`src/components/ui/`) in their original form — never raw `<input>`, `<button>`, etc. Components from `src/components/ui/` must be used as-is; do not add extra styling, wrapper divs, or override className unless the component exposes it via props. This ensures visual consistency across pages.
6. **Every input** must have validation error in red below + a description.
7. **Components must be small logical pieces** — avoid monolithic components.
8. Locale files are flat-merged at runtime (no nested JSON key structure).
9. **Küçük mantıksal parçalara ayır** — tek bir fonksiyon/component birden fazla iş yapmamalı. Backend'de servisleri, frontend'de componentleri mantıksal sınırlarına göre böl.
10. **Tekrar eden yapıları componentleştir** — bir UI kalıbı 2+ yerde kullanılıyorsa ortak bir component olarak ayır.
11. **Max 300 satır** — component veya sayfa dosyaları 300 satırı geçmemeli. Geçiyorsa mantıksal alt parçalara böl.
12. **Sadece Türkçe localization** — yeni eklenen metinler yalnızca `tr/common.json` ve varsa `tr/` altındaki locale dosyalarına girilir. `en/` dosyalarına ekleme yapılmaz.

### Null handling
**No `??` fallbacks** — if a value is null, let it throw at runtime. Do not add default/fallback values.

## Key dependencies

| Layer | Tech |
|---|---|
| ORM | EF Core 10 + Npgsql |
| Auth | JWT Bearer + Google.Apis.Auth |
| Validation | FluentValidation |
| Frontend state | Zustand |
| Forms | react-hook-form + zod |
| i18n | react-i18next (tr/en flat JSON) |
| HTTP | Axios (auto-refresh on 401) |
| UI | shadcn/ui (Radix + Tailwind) |
| reCAPTCHA | react-google-recaptcha |
