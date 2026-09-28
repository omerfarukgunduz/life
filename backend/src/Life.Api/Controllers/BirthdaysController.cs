using Life.Api.Auth;
using Life.Api.Data;
using Life.Api.DTOs;
using Life.Api.Entities;
using Life.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/birthdays")]
public class BirthdaysController : ControllerBase
{
    private readonly LifeDbContext _db;
    private readonly ReminderService _reminders;
    public BirthdaysController(LifeDbContext db, ReminderService reminders) { _db = db; _reminders = reminders; }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BirthdayDto>>> List([FromQuery] string? filter, [FromQuery] string? timeZone, CancellationToken ct)
    {
        var today = TimeZoneHelper.TodayIn(TimeZoneHelper.Resolve(timeZone));
        var items = await _db.Birthdays.AsNoTracking().Where(b => b.UserId == User.GetUserId()).ToListAsync(ct);
        IEnumerable<Birthday> filtered = (filter ?? "all").ToLowerInvariant() switch
        {
            "month" => items.Where(b => b.BirthMonth == today.Month),
            "upcoming" => items.Where(b =>
            {
                var occ = ReminderService.NextBirthdayOccurrence(b.BirthMonth, b.BirthDay, today);
                return occ >= today && occ <= today.AddDays(30);
            }),
            _ => items
        };
        return Ok(filtered.OrderBy(b => ReminderService.NextBirthdayOccurrence(b.BirthMonth, b.BirthDay, today)).ThenBy(b => b.Name).Select(Mappers.ToDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BirthdayDto>> Get(Guid id, CancellationToken ct)
    {
        var entity = await _db.Birthdays.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id && b.UserId == User.GetUserId(), ct);
        return entity is null ? NotFound() : Ok(Mappers.ToDto(entity));
    }

    [HttpPost]
    public async Task<ActionResult<BirthdayDto>> Create([FromBody] CreateBirthdayRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var settings = await GetSettings(userId, ct);
        var entity = new Birthday
        {
            Id = Guid.NewGuid(), UserId = userId, Name = request.Name.Trim(), BirthMonth = request.BirthMonth,
            BirthDay = request.BirthDay, BirthYear = request.BirthYear, Note = request.Note,
            ReminderDaysBefore = request.ReminderDaysBefore?.ToList() ?? new List<int>(), CreatedAt = DateTime.UtcNow
        };
        _db.Birthdays.Add(entity);
        await _reminders.RefreshBirthdayRemindersAsync(entity, settings.TimeZone, ct);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, Mappers.ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BirthdayDto>> Update(Guid id, [FromBody] UpdateBirthdayRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var entity = await _db.Birthdays.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId, ct);
        if (entity is null) return NotFound();
        entity.Name = request.Name.Trim(); entity.BirthMonth = request.BirthMonth; entity.BirthDay = request.BirthDay;
        entity.BirthYear = request.BirthYear; entity.Note = request.Note;
        entity.ReminderDaysBefore = request.ReminderDaysBefore?.ToList() ?? new List<int>();
        var settings = await GetSettings(userId, ct);
        await _reminders.RefreshBirthdayRemindersAsync(entity, settings.TimeZone, ct);
        await _db.SaveChangesAsync(ct);
        return Ok(Mappers.ToDto(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var entity = await _db.Birthdays.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId, ct);
        if (entity is null) return NotFound();
        await _reminders.RemoveUnsentAsync(userId, EntityType.Birthday, id, ct);
        _db.Birthdays.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<UserSettings> GetSettings(Guid userId, CancellationToken ct) =>
        await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId, ct)
        ?? new UserSettings { UserId = userId, TimeZone = TimeZoneHelper.DefaultTimeZone };
}
