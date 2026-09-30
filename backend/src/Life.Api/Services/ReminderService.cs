using Life.Api.Data;
using Life.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Services;

public class ReminderService
{
    public static readonly TimeOnly DefaultReminderTime = new(9, 0);

    private readonly LifeDbContext _db;
    public ReminderService(LifeDbContext db) => _db = db;

    public static TimeOnly ResolveReminderTime(TimeOnly? fromSettings) =>
        fromSettings ?? DefaultReminderTime;

    public async Task RefreshTaskRemindersAsync(
        TaskItem task,
        string timeZoneId,
        TimeOnly defaultReminderTime,
        CancellationToken ct = default)
    {
        await RemoveUnsentAsync(task.UserId, EntityType.Task, task.Id, ct);
        if (!task.DueDate.HasValue || task.IsCompleted) return;
        var tz = TimeZoneHelper.Resolve(timeZoneId);
        var time = task.DueTime ?? defaultReminderTime;
        var reminderAt = TimeZoneHelper.ToUtc(task.DueDate.Value, time, tz);
        if (reminderAt < DateTime.UtcNow) return;
        _db.Reminders.Add(new Reminder
        {
            Id = Guid.NewGuid(), UserId = task.UserId, EntityType = EntityType.Task, EntityId = task.Id,
            ReminderAt = reminderAt, Sent = false, CreatedAt = DateTime.UtcNow
        });
    }

    public async Task RefreshBirthdayRemindersAsync(
        Birthday birthday,
        string timeZoneId,
        TimeOnly defaultReminderTime,
        CancellationToken ct = default)
    {
        await RemoveUnsentAsync(birthday.UserId, EntityType.Birthday, birthday.Id, ct);
        var tz = TimeZoneHelper.Resolve(timeZoneId);
        var today = TimeZoneHelper.TodayIn(tz);
        var nextOccurrence = NextBirthdayOccurrence(birthday.BirthMonth, birthday.BirthDay, today);
        foreach (var daysBefore in birthday.ReminderDaysBefore.Distinct())
        {
            var reminderDate = nextOccurrence.AddDays(-daysBefore);
            var reminderAt = TimeZoneHelper.ToUtc(reminderDate, defaultReminderTime, tz);
            if (reminderAt < DateTime.UtcNow) continue;
            _db.Reminders.Add(new Reminder
            {
                Id = Guid.NewGuid(), UserId = birthday.UserId, EntityType = EntityType.Birthday, EntityId = birthday.Id,
                ReminderAt = reminderAt, Sent = false, CreatedAt = DateTime.UtcNow
            });
        }
    }

    public async Task RefreshContestRemindersAsync(
        PhotographyContest contest,
        string timeZoneId,
        TimeOnly defaultReminderTime,
        CancellationToken ct = default)
    {
        await RemoveUnsentAsync(contest.UserId, EntityType.Contest, contest.Id, ct);
        var tz = TimeZoneHelper.Resolve(timeZoneId);
        foreach (var daysBefore in contest.ReminderDaysBefore.Distinct())
        {
            var reminderDate = contest.Deadline.AddDays(-daysBefore);
            var reminderAt = TimeZoneHelper.ToUtc(reminderDate, defaultReminderTime, tz);
            if (reminderAt < DateTime.UtcNow) continue;
            _db.Reminders.Add(new Reminder
            {
                Id = Guid.NewGuid(), UserId = contest.UserId, EntityType = EntityType.Contest, EntityId = contest.Id,
                ReminderAt = reminderAt, Sent = false, CreatedAt = DateTime.UtcNow
            });
        }
    }

    public async Task ResyncAllRemindersForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var settings = await _db.UserSettings.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId, ct);
        var timeZone = settings?.TimeZone ?? TimeZoneHelper.DefaultTimeZone;
        var reminderTime = ResolveReminderTime(settings?.ReminderTime);

        var tasks = await _db.Tasks.Where(t => t.UserId == userId).ToListAsync(ct);
        foreach (var task in tasks)
            await RefreshTaskRemindersAsync(task, timeZone, reminderTime, ct);

        var birthdays = await _db.Birthdays.Where(b => b.UserId == userId).ToListAsync(ct);
        foreach (var birthday in birthdays)
            await RefreshBirthdayRemindersAsync(birthday, timeZone, reminderTime, ct);

        var contests = await _db.Contests.Where(c => c.UserId == userId).ToListAsync(ct);
        foreach (var contest in contests)
            await RefreshContestRemindersAsync(contest, timeZone, reminderTime, ct);

        await _db.SaveChangesAsync(ct);
    }

    public async Task RemoveUnsentAsync(Guid userId, EntityType entityType, Guid entityId, CancellationToken ct = default)
    {
        var existing = await _db.Reminders
            .Where(r => r.UserId == userId && r.EntityType == entityType && r.EntityId == entityId && !r.Sent)
            .ToListAsync(ct);
        _db.Reminders.RemoveRange(existing);
    }

    public async Task EnsureUpcomingBirthdayRemindersAsync(CancellationToken ct = default)
    {
        var birthdays = await _db.Birthdays.Include(b => b.User).ThenInclude(u => u.Settings).ToListAsync(ct);
        foreach (var birthday in birthdays)
        {
            var timeZone = birthday.User.Settings?.TimeZone ?? TimeZoneHelper.DefaultTimeZone;
            var reminderTime = ResolveReminderTime(birthday.User.Settings?.ReminderTime);
            var tz = TimeZoneHelper.Resolve(timeZone);
            var today = TimeZoneHelper.TodayIn(tz);
            var nextOccurrence = NextBirthdayOccurrence(birthday.BirthMonth, birthday.BirthDay, today);
            var unsent = await _db.Reminders
                .Where(r => r.UserId == birthday.UserId && r.EntityType == EntityType.Birthday && r.EntityId == birthday.Id && !r.Sent)
                .ToListAsync(ct);
            foreach (var daysBefore in birthday.ReminderDaysBefore.Distinct())
            {
                var reminderDate = nextOccurrence.AddDays(-daysBefore);
                var reminderAt = TimeZoneHelper.ToUtc(reminderDate, reminderTime, tz);
                if (reminderAt < DateTime.UtcNow) continue;
                if (unsent.Any(r => Math.Abs((r.ReminderAt - reminderAt).TotalMinutes) < 1)) continue;
                _db.Reminders.Add(new Reminder
                {
                    Id = Guid.NewGuid(), UserId = birthday.UserId, EntityType = EntityType.Birthday, EntityId = birthday.Id,
                    ReminderAt = reminderAt, Sent = false, CreatedAt = DateTime.UtcNow
                });
            }
        }
        await _db.SaveChangesAsync(ct);
    }

    public static DateOnly NextBirthdayOccurrence(int month, int day, DateOnly from)
    {
        var year = from.Year;
        var candidate = SafeDate(year, month, day);
        if (candidate < from) candidate = SafeDate(year + 1, month, day);
        return candidate;
    }

    private static DateOnly SafeDate(int year, int month, int day)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);
        return new DateOnly(year, month, Math.Min(day, daysInMonth));
    }
}
