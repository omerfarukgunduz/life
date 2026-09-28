using Life.Api.Auth;
using Life.Api.Data;
using Life.Api.DTOs;
using Life.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboard;
    public DashboardController(DashboardService dashboard) => _dashboard = dashboard;

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> Dashboard([FromQuery] string? timeZone, CancellationToken ct)
        => Ok(await _dashboard.GetAsync(User.GetUserId(), timeZone, ct));

    [HttpGet("calendar")]
    public async Task<ActionResult<IReadOnlyList<CalendarItemDto>>> Calendar([FromQuery] string from, [FromQuery] string to, [FromQuery] string? timeZone, CancellationToken ct)
    {
        if (!TimeZoneHelper.TryParseDate(from, out var fromDate) || !TimeZoneHelper.TryParseDate(to, out var toDate))
            return BadRequest(new ProblemDetails { Status = 400, Title = "Geçersiz tarih", Detail = "from ve to parametreleri yyyy-MM-dd formatında olmalıdır." });
        if (toDate < fromDate)
            return BadRequest(new ProblemDetails { Status = 400, Title = "Geçersiz aralık", Detail = "to, from tarihinden önce olamaz." });
        return Ok(await _dashboard.GetCalendarAsync(User.GetUserId(), fromDate, toDate, timeZone, ct));
    }
}

[ApiController]
[Authorize]
[Route("api/reminders")]
public class RemindersController : ControllerBase
{
    private readonly LifeDbContext _db;
    public RemindersController(LifeDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReminderDto>>> List(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var items = await _db.Reminders.AsNoTracking()
            .Where(r => r.UserId == User.GetUserId() && !r.Sent && r.ReminderAt >= now)
            .OrderBy(r => r.ReminderAt).Take(100).ToListAsync(ct);
        return Ok(items.Select(Mappers.ToDto).ToList());
    }
}

[ApiController]
[Authorize]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly LifeDbContext _db;
    public SettingsController(LifeDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<SettingsDto>> Get(CancellationToken ct)
    {
        var settings = await _db.UserSettings.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == User.GetUserId(), ct);
        return Ok(settings is null ? new SettingsDto(TimeZoneHelper.DefaultTimeZone, true, true, true) : Mappers.ToDto(settings));
    }

    [HttpPut]
    public async Task<ActionResult<SettingsDto>> Put([FromBody] UpdateSettingsRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var settings = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId, ct);
        if (settings is null)
        {
            settings = new Entities.UserSettings { UserId = userId };
            _db.UserSettings.Add(settings);
        }
        settings.TimeZone = request.TimeZone.Trim();
        settings.NotifyTasks = request.NotifyTasks;
        settings.NotifyBirthdays = request.NotifyBirthdays;
        settings.NotifyContests = request.NotifyContests;
        await _db.SaveChangesAsync(ct);
        return Ok(Mappers.ToDto(settings));
    }
}

[ApiController]
[Route("api/push")]
public class PushController : ControllerBase
{
    private readonly LifeDbContext _db;
    private readonly IConfiguration _configuration;
    public PushController(LifeDbContext db, IConfiguration configuration) { _db = db; _configuration = configuration; }

    [AllowAnonymous]
    [HttpGet("vapid-public-key")]
    public ActionResult<VapidPublicKeyResponse> VapidPublicKey()
        => Ok(new VapidPublicKeyResponse(
            _configuration["Push:PublicKey"] ?? _configuration["Vapid:PublicKey"] ?? string.Empty));

    [Authorize]
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscribeRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var existing = await _db.PushSubscriptions.FirstOrDefaultAsync(s => s.UserId == userId && s.Endpoint == request.Endpoint, ct);
        if (existing is null)
            _db.PushSubscriptions.Add(new Entities.PushSubscription { Id = Guid.NewGuid(), UserId = userId, Endpoint = request.Endpoint, P256dh = request.P256dh, Auth = request.Auth, CreatedAt = DateTime.UtcNow });
        else { existing.P256dh = request.P256dh; existing.Auth = request.Auth; }
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("subscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] PushUnsubscribeRequest request, CancellationToken ct)
    {
        var existing = await _db.PushSubscriptions.Where(s => s.UserId == User.GetUserId() && s.Endpoint == request.Endpoint).ToListAsync(ct);
        if (existing.Count > 0) { _db.PushSubscriptions.RemoveRange(existing); await _db.SaveChangesAsync(ct); }
        return NoContent();
    }
}

[ApiController]
[Authorize]
[Route("api")]
public class DataTransferController : ControllerBase
{
    private readonly ExportImportService _exportImport;
    public DataTransferController(ExportImportService exportImport) => _exportImport = exportImport;

    [HttpGet("export")]
    public async Task<ActionResult<ExportDataDto>> Export(CancellationToken ct)
        => Ok(await _exportImport.ExportAsync(User.GetUserId(), ct));

    [HttpPost("import")]
    public async Task<IActionResult> Import([FromBody] ExportDataDto data, CancellationToken ct)
    {
        if (data.Version != 1)
            return BadRequest(new ProblemDetails { Status = 400, Title = "Geçersiz sürüm", Detail = "Yalnızca version:1 desteklenir." });
        await _exportImport.ImportAsync(User.GetUserId(), data, ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public ActionResult<HealthResponse> Get() => Ok(new HealthResponse("ok"));
}
