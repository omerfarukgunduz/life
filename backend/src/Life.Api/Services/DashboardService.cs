using Life.Api.Data;
using Life.Api.DTOs;
using Life.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Services;

public class DashboardService
{
    private readonly LifeDbContext _db;
    public DashboardService(LifeDbContext db) => _db = db;

    public async Task<DashboardDto> GetAsync(Guid userId, string? timeZone, CancellationToken ct = default)
    {
        var tz = TimeZoneHelper.Resolve(timeZone);
        var today = TimeZoneHelper.TodayIn(tz);
        var end = today.AddDays(7);
        var tasks = await _db.Tasks.AsNoTracking().Where(t => t.UserId == userId).ToListAsync(ct);
        var todayTasks = tasks.Where(t => !t.IsCompleted && t.DueDate == today)
            .OrderBy(t => t.DueTime ?? TimeOnly.MaxValue).ThenBy(t => t.Title).Select(Mappers.ToDto).ToList();
        var upcoming = new List<UpcomingItemDto>();
        foreach (var task in tasks.Where(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value > today && t.DueDate.Value <= end))
            upcoming.Add(new UpcomingItemDto(TimeZoneHelper.FormatDate(task.DueDate!.Value), "task", task.Title,
                task.DueTime.HasValue ? TimeZoneHelper.FormatTime(task.DueTime.Value) : null, task.Id));
        var birthdays = await _db.Birthdays.AsNoTracking().Where(b => b.UserId == userId).ToListAsync(ct);
        foreach (var birthday in birthdays)
        {
            var occurrence = ReminderService.NextBirthdayOccurrence(birthday.BirthMonth, birthday.BirthDay, today);
            if (occurrence >= today && occurrence <= end)
            {
                var subtitle = birthday.BirthYear.HasValue ? $"{occurrence.Year - birthday.BirthYear.Value} yaş" : null;
                upcoming.Add(new UpcomingItemDto(TimeZoneHelper.FormatDate(occurrence), "birthday", birthday.Name, subtitle, birthday.Id));
            }
        }
        var contests = await _db.Contests.AsNoTracking().Where(c => c.UserId == userId && c.Deadline >= today && c.Deadline <= end).ToListAsync(ct);
        foreach (var contest in contests)
            upcoming.Add(new UpcomingItemDto(TimeZoneHelper.FormatDate(contest.Deadline), "contest", contest.Title, contest.Status.ToString(), contest.Id));
        var ordered = upcoming.OrderBy(u => u.Date).ThenBy(u => u.Type).ThenBy(u => u.Title).ToList();
        var readingBook = await _db.Books.AsNoTracking()
            .Where(b => b.UserId == userId && b.Status == BookStatus.Reading)
            .OrderByDescending(b => b.StartedAt).ThenByDescending(b => b.CreatedAt).FirstOrDefaultAsync(ct);
        var todayReminders = await GetTodayRemindersAsync(userId, tz, today, ct);
        return new DashboardDto(todayTasks, ordered, readingBook is null ? null : Mappers.ToDto(readingBook), todayReminders);
    }

    private async Task<IReadOnlyList<TodayReminderItemDto>> GetTodayRemindersAsync(
        Guid userId,
        TimeZoneInfo tz,
        DateOnly today,
        CancellationToken ct)
    {
        var dayStart = TimeZoneHelper.ToUtc(today, TimeOnly.MinValue, tz);
        var dayEnd = TimeZoneHelper.ToUtc(today.AddDays(1), TimeOnly.MinValue, tz);
        var reminders = await _db.Reminders.AsNoTracking()
            .Where(r => r.UserId == userId && r.ReminderAt >= dayStart && r.ReminderAt < dayEnd)
            .OrderBy(r => r.ReminderAt)
            .ToListAsync(ct);
        if (reminders.Count == 0) return Array.Empty<TodayReminderItemDto>();

        var taskIds = reminders.Where(r => r.EntityType == EntityType.Task).Select(r => r.EntityId).ToHashSet();
        var birthdayIds = reminders.Where(r => r.EntityType == EntityType.Birthday).Select(r => r.EntityId).ToHashSet();
        var contestIds = reminders.Where(r => r.EntityType == EntityType.Contest).Select(r => r.EntityId).ToHashSet();

        var tasks = taskIds.Count == 0
            ? new Dictionary<Guid, TaskItem>()
            : await _db.Tasks.AsNoTracking().Where(t => taskIds.Contains(t.Id)).ToDictionaryAsync(t => t.Id, ct);
        var birthdays = birthdayIds.Count == 0
            ? new Dictionary<Guid, Birthday>()
            : await _db.Birthdays.AsNoTracking().Where(b => birthdayIds.Contains(b.Id)).ToDictionaryAsync(b => b.Id, ct);
        var contests = contestIds.Count == 0
            ? new Dictionary<Guid, PhotographyContest>()
            : await _db.Contests.AsNoTracking().Where(c => contestIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id, ct);

        var items = new List<TodayReminderItemDto>();
        foreach (var reminder in reminders)
        {
            var (type, title) = reminder.EntityType switch
            {
                EntityType.Task when tasks.TryGetValue(reminder.EntityId, out var task) => ("task", task.Title),
                EntityType.Birthday when birthdays.TryGetValue(reminder.EntityId, out var birthday) => ("birthday", birthday.Name),
                EntityType.Contest when contests.TryGetValue(reminder.EntityId, out var contest) => ("contest", contest.Title),
                EntityType.Task => ("task", "İş"),
                EntityType.Birthday => ("birthday", "Doğum günü"),
                EntityType.Contest => ("contest", "Yarışma"),
                _ => ("task", "Hatırlatma"),
            };
            items.Add(new TodayReminderItemDto(type, reminder.EntityId, title, reminder.ReminderAt, reminder.Sent));
        }
        return items;
    }

    public async Task<IReadOnlyList<CalendarItemDto>> GetCalendarAsync(Guid userId, DateOnly from, DateOnly to, string? timeZone, CancellationToken ct = default)
    {
        _ = TimeZoneHelper.Resolve(timeZone);
        var items = new List<CalendarItemDto>();
        var tasks = await _db.Tasks.AsNoTracking().Where(t => t.UserId == userId && t.DueDate.HasValue && t.DueDate >= from && t.DueDate <= to).ToListAsync(ct);
        foreach (var task in tasks)
            items.Add(new CalendarItemDto(TimeZoneHelper.FormatDate(task.DueDate!.Value),
                task.DueTime.HasValue ? TimeZoneHelper.FormatTime(task.DueTime.Value) : null, "task", task.Title, task.Id));
        var birthdays = await _db.Birthdays.AsNoTracking().Where(b => b.UserId == userId).ToListAsync(ct);
        for (var year = from.Year; year <= to.Year; year++)
        {
            foreach (var birthday in birthdays)
            {
                var day = Math.Min(birthday.BirthDay, DateTime.DaysInMonth(year, birthday.BirthMonth));
                var occurrence = new DateOnly(year, birthday.BirthMonth, day);
                if (occurrence >= from && occurrence <= to)
                    items.Add(new CalendarItemDto(TimeZoneHelper.FormatDate(occurrence), null, "birthday", birthday.Name, birthday.Id));
            }
        }
        var contests = await _db.Contests.AsNoTracking().Where(c => c.UserId == userId && c.Deadline >= from && c.Deadline <= to).ToListAsync(ct);
        foreach (var contest in contests)
            items.Add(new CalendarItemDto(TimeZoneHelper.FormatDate(contest.Deadline), null, "contest", contest.Title, contest.Id));
        return items.OrderBy(i => i.Date).ThenBy(i => i.Time ?? "99:99").ThenBy(i => i.Title).ToList();
    }
}
