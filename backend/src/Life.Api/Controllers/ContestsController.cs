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
[Route("api/contests")]
public class ContestsController : ControllerBase
{
    private readonly LifeDbContext _db;
    private readonly ReminderService _reminders;
    public ContestsController(LifeDbContext db, ReminderService reminders) { _db = db; _reminders = reminders; }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ContestDto>>> List(CancellationToken ct)
    {
        var items = await _db.Contests.AsNoTracking().Where(x => x.UserId == User.GetUserId()).OrderBy(x => x.Deadline).ThenBy(x => x.Title).ToListAsync(ct);
        return Ok(items.Select(Mappers.ToDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContestDto>> Get(Guid id, CancellationToken ct)
    {
        var entity = await _db.Contests.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.UserId == User.GetUserId(), ct);
        return entity is null ? NotFound() : Ok(Mappers.ToDto(entity));
    }

    [HttpPost]
    public async Task<ActionResult<ContestDto>> Create([FromBody] CreateContestRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        TimeZoneHelper.TryParseDate(request.Deadline, out var deadline);
        var status = ContestStatus.Interested;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse(request.Status, true, out ContestStatus s)) status = s;
        var entity = new PhotographyContest
        {
            Id = Guid.NewGuid(), UserId = userId, Title = request.Title.Trim(), Deadline = deadline,
            Url = request.Url, Description = request.Description, Status = status,
            ReminderDaysBefore = request.ReminderDaysBefore?.ToList() ?? new List<int>(), CreatedAt = DateTime.UtcNow
        };
        var settings = await GetSettings(userId, ct);
        _db.Contests.Add(entity);
        await _reminders.RefreshContestRemindersAsync(entity, settings.TimeZone, settings.ReminderTime, ct);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, Mappers.ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ContestDto>> Update(Guid id, [FromBody] UpdateContestRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var entity = await _db.Contests.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        if (entity is null) return NotFound();
        TimeZoneHelper.TryParseDate(request.Deadline, out var deadline);
        entity.Title = request.Title.Trim(); entity.Deadline = deadline; entity.Url = request.Url; entity.Description = request.Description;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse(request.Status, true, out ContestStatus s)) entity.Status = s;
        entity.ReminderDaysBefore = request.ReminderDaysBefore?.ToList() ?? new List<int>();
        var settings = await GetSettings(userId, ct);
        await _reminders.RefreshContestRemindersAsync(entity, settings.TimeZone, settings.ReminderTime, ct);
        await _db.SaveChangesAsync(ct);
        return Ok(Mappers.ToDto(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var entity = await _db.Contests.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        if (entity is null) return NotFound();
        await _reminders.RemoveUnsentAsync(userId, EntityType.Contest, id, ct);
        _db.Contests.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<UserSettings> GetSettings(Guid userId, CancellationToken ct) =>
        await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId, ct)
        ?? new UserSettings { UserId = userId, TimeZone = TimeZoneHelper.DefaultTimeZone };
}
