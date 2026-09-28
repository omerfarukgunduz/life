# Life

Kişisel mobil öncelikli PWA. Backend: .NET 8 Web API + SQL Server. Frontend: React (Vite).

## Development kurulumu

### Gereksinimler

- Docker (SQL Server)
- .NET 8 SDK
- Node.js 20+

macOS’ta Homebrew ile .NET 8:

```bash
brew install dotnet@8
export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
```

### Ortam dosyaları

```bash
cp .env.example .env
cp backend/src/Life.Api/appsettings.Development.example.json backend/src/Life.Api/appsettings.Development.json
```

`.env` içinde `MSSQL_SA_PASSWORD` değerini ayarla. `appsettings.Development.json` içinde connection string, JWT ve VAPID anahtarlarını doldur (bu dosya gitignore’ludur).

### SQL Server (Docker)

```bash
docker compose up -d
```

Container adı: `life-sqlserver`, port: `1433`. Healthy olana kadar bekle:

```bash
docker ps --filter name=life-sqlserver
```

### Connection string

`appsettings.Development.json`:

```json
"ConnectionStrings": {
  "Default": "Server=localhost,1433;Database=Life;User Id=sa;Password=YOUR_SA_PASSWORD;TrustServerCertificate=True;Encrypt=True"
}
```

Ortam değişkeni ile de verilebilir:

```bash
export ConnectionStrings__Default="Server=localhost,1433;Database=Life;User Id=sa;Password=YOUR_SA_PASSWORD;TrustServerCertificate=True;Encrypt=True"
```

### Migration

```bash
export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
cd backend
./.tools/dotnet-ef database update --project src/Life.Api/Life.Api.csproj --startup-project src/Life.Api/Life.Api.csproj
```

Alternatif (lokal tool manifest):

```bash
cd backend
dotnet tool restore
dotnet ef database update --project src/Life.Api/Life.Api.csproj --startup-project src/Life.Api/Life.Api.csproj
```

### Backend

Development portu: `http://localhost:5080`

```bash
export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
cd backend/src/Life.Api
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

Sağlık kontrolü: `GET http://localhost:5080/api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite genelde `http://localhost:5173` açar. `/api` istekleri `http://localhost:5080` adresine proxy edilir.

### Geliştirme kullanıcısı

Seed yalnızca `Development` ortamında ve kullanıcı yokken çalışır. E-posta ve parola `appsettings.Development.json` içindeki `Seed` bölümünden gelir. Örnek dosya: `backend/src/Life.Api/appsettings.Development.example.json`.

Production’da seed çalışmaz.

### PWA (development)

Localhost tarayıcıda güvenli origin sayılır; service worker ve Web Push development’ta çalışabilir. Fiziksel telefonda test için HTTPS gerekir (ör. reverse proxy veya tünel).

## Production build

### Backend

```bash
export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
cd backend/src/Life.Api
dotnet publish -c Release -o ./publish
```

### Frontend

```bash
cd frontend
npm run build
```

Çıktı: `frontend/dist`. `public/web.config` SPA fallback için `dist` içine kopyalanır.

## Windows Server (IIS)

### Önkoşullar

- [ASP.NET Core Hosting Bundle](https://dotnet.microsoft.com/download/dotnet/8.0) (.NET 8)
- IIS URL Rewrite
- Application Request Routing (ARR) — `/api` için reverse proxy

### Application Pool

- .NET CLR version: **No Managed Code**
- `startMode`: **AlwaysRunning**
- Idle timeout: **0** (`BackgroundService` hatırlatma işçisi için)

### Backend sitesi

`dotnet publish -c Release` çıktısını ayrı bir siteye (ör. `life-api`, `http://localhost:5080` veya dahili port) koy. ASP.NET Core Module `web.config` publish sırasında üretilir.

### Frontend sitesi / tek site önerisi

Önerilen kurulum: **tek IIS sitesi**, aynı origin:

- Kök: `frontend/dist` (statik dosyalar + SPA `web.config`)
- `/api` → ARR ile backend Application Pool / site’e proxy

`frontend/public/web.config` SPA fallback sağlar; `/api` yollarını rewrite etmez.

### HTTPS

Web Push için HTTPS zorunludur. Sertifikayı site bağlarına ekle.

### Production ortam değişkenleri

Sırlar dosyaya yazma; IIS veya ortam değişkeni kullan:

| Değişken | Açıklama |
| --- | --- |
| `ConnectionStrings__Default` | SQL Server connection string |
| `Jwt__Key` | En az 32 bayt rastgele anahtar |
| `Jwt__Issuer` | örn. `Life` |
| `Jwt__Audience` | örn. `Life` |
| `Push__PublicKey` | VAPID public key |
| `Push__PrivateKey` | VAPID private key |
| `Push__Subject` | örn. `mailto:you@example.com` |
| `AllowRegistration` | `false` |

Seed production’da çalışmaz; kullanıcıyı ayrı oluştur.

## Proje yapısı

```
life/
  docker-compose.yml
  .env.example
  backend/src/Life.Api/
  frontend/
```
