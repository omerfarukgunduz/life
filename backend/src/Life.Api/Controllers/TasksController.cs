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
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly LifeDbContext _db;
    private readonly ReminderService _reminders;
    public TasksController(LifeDbContext db, ReminderService reminders) { _db = db; _reminders = reminders; }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskDto>>> List([FromQuery] string? filter, [FromQuery] string? timeZone, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var today = TimeZoneHelper.TodayIn(TimeZoneHelper.Resolve(timeZone));
        var items = await _db.Tasks.AsNoTracking().Where(t => t.UserId == userId).ToListAsync(ct);
        IEnumerable<TaskItem> filtered = (filter ?? "all").ToLowerInvariant() switch
        {
            "today" => items.Where(t => !t.IsCompleted && t.DueDate == today),
            "upcoming" => items.Where(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value > today),
            "completed" => items.Where(t => t.IsCompleted),
            _ => items
        };
        return Ok(filtered.OrderBy(t => t.IsCompleted).ThenBy(t => t.DueDate ?? DateOnly.MaxValue).ThenBy(t => t.DueTime ?? TimeOnly.MaxValue).ThenBy(t => t.Title).Select(Mappers.ToDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDto>> Get(Guid id, CancellationToken ct)
    {
        var entity = await _db.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id && t.UserId == User.GetUserId(), ct);
        return entity is null ? NotFound() : Ok(Mappers.ToDto(entity));
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create([FromBody] CreateTaskRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var settings = await GetSettings(userId, ct);
        DateOnly? dueDate = TimeZoneHelper.TryParseDate(request.DueDate, out var d) ? d : null;
        TimeOnly? dueTime = TimeZoneHelper.TryParseTime(request.DueTime, out var t) ? t : null;
        var priority = Priority.Normal;
        if (!string.IsNullOrWhiteSpace(request.Priority) && Enum.TryParse(request.Priority, true, out Priority p)) priority = p;
        var isCompleted = request.IsCompleted ?? false;
        var entity = new TaskItem
        {
            Id = Guid.NewGuid(), UserId = userId, Title = request.Title.Trim(), Description = request.Description,
            DueDate = dueDate, DueTime = dueTime, Priority = priority,
            Category = string.IsNullOrWhiteSpace(request.Category) ? CategoryOptions.Default : request.Category,
            IsCompleted = isCompleted, CreatedAt = DateTime.UtcNow, CompletedAt = isCompleted ? DateTime.UtcNow : null
        };
        _db.Tasks.Add(entity);
        await _reminders.RefreshTaskRemindersAsync(entity, settings.TimeZone, settings.ReminderTime, ct);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, Mappers.ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskDto>> Update(Guid id, [FromBody] UpdateTaskRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var entity = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
        if (entity is null) return NotFound();
        entity.Title = request.Title.Trim();
        entity.Description = request.Description;
        entity.DueDate = string.IsNullOrWhiteSpace(request.DueDate) ? null : (TimeZoneHelper.TryParseDate(request.DueDate, out var d) ? d : entity.DueDate);
        entity.DueTime = string.IsNullOrWhiteSpace(request.DueTime) ? null : (TimeZoneHelper.TryParseTime(request.DueTime, out var t) ? t : entity.DueTime);
        if (!string.IsNullOrWhiteSpace(request.Priority) && Enum.TryParse(request.Priority, true, out Priority p)) entity.Priority = p;
        if (!string.IsNullOrWhiteSpace(request.Category)) entity.Category = request.Category;
        if (request.IsCompleted.HasValue)
        {
            if (request.IsCompleted.Value && !entity.IsCompleted) entity.CompletedAt = DateTime.UtcNow;
            else if (!request.IsCompleted.Value) entity.CompletedAt = null;
            entity.IsCompleted = request.IsCompleted.Value;
        }
        var settings = await GetSettings(userId, ct);
        await _reminders.RefreshTaskRemindersAsync(entity, settings.TimeZone, settings.ReminderTime, ct);
        await _db.SaveChangesAsync(ct);
        return Ok(Mappers.ToDto(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var entity = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
        if (entity is null) return NotFound();
        await _reminders.RemoveUnsentAsync(userId, EntityType.Task, id, ct);
        _db.Tasks.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<UserSettings> GetSettings(Guid userId, CancellationToken ct) =>
        await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId, ct)
        ?? new UserSettings { UserId = userId, TimeZone = TimeZoneHelper.DefaultTimeZone };
}
