# Vector

## Monorepo layout

- `Vector.sln` — Solution root (VS 2022+)
  - `Vector.Api` — .NET 10 ASP.NET Core Web API (C#, EF Core, Npgsql PostgreSQL)
  - `Vector.UI` — Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui

## Backend commands

```powershell
# Build (from repo root)
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

### Kurallar (`.agents/rules/`)
1. **Backend'de `record` keyword'ü kullanma.**
2. **FluentValidation, model sınıfıyla aynı dosyada olmalı.**
   **Her model kendi dosyasında olmalı** — birden fazla model aynı dosyada bulunamaz. Model ve validatörü aynı dosyada kalır ancak başka bir model bu dosyaya eklenmez.
3. **Tüm API mesajları İngilizce olmalı.** Mümkün olduğunda FluentValidation'ın varsayılan mesajları kullanılmalı.
4. **Frontend'de magic string kullanma** — her zaman i18n locale dosyalarını (`src/i18n/locales/{en,tr}/`) kullan.
5. **shadcn/ui componentlerini** (`src/components/ui/`) orijinal halleriyle kullan — hiçbir zaman doğrudan `<input>`, `<button>` vb. kullanma. `src/components/ui/` altındaki componentler olduğu gibi kullanılmalı; component prop olarak desteklemiyorsa ekstra stil, wrapper `div` veya `className` override eklenmemeli. Bu, tüm sayfalarda görsel tutarlılığı sağlar.
6. **Her input için** aşağıda kırmızı renkte validation hatası (`FormMessage`) ve bir açıklama (`FormDescription`) bulunmalı.
7. **Componentler küçük ve mantıksal parçalardan oluşmalı** — monolitik componentlerden kaçın.
8. **Locale dosyaları runtime sırasında flat-merge edilir** — iç içe JSON key yapısı kullanılmaz.
9. **Küçük mantıksal parçalara ayır** — tek bir fonksiyon/component birden fazla iş yapmamalı. Backend'de servisleri, frontend'de componentleri mantıksal sınırlarına göre böl.
10. **Tekrar eden yapıları componentleştir** — bir UI kalıbı 2 veya daha fazla yerde kullanılıyorsa ortak bir component olarak ayır.
11. **Maksimum 300 satır** — component veya sayfa dosyaları 300 satırı geçmemeli. Geçiyorsa mantıksal alt parçalara böl.
12. **Sadece Türkçe localization** — yeni eklenen metinler yalnızca `tr/common.json` ve varsa `tr/` altındaki locale dosyalarına eklenir. `en/` dosyalarına ekleme yapılmaz.
13. **Ternary `:` kullanımı** — JSX içinde ternary (`condition ? <A> : <B>`) kullanıldığında, `:` öncesindeki ve sonrasındaki içerikler ayrı fonksiyonlara çıkarılmalıdır (`renderLoading()`, `renderEmpty()`, `renderContent()` gibi). Ternary yalnızca hangi fonksiyonun çağrılacağını seçmek için kullanılmalı; JSX doğrudan ternary içinde yazılmamalıdır.

### Null kullanımı
**`??` ile fallback kullanma** — bir değer `null` ise runtime'da hata vermesine izin ver. Varsayılan veya fallback değer ekleme.

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
