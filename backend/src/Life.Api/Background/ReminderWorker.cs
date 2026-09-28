using Life.Api.Data;
using Life.Api.Entities;
using Life.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Background;

public class ReminderWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReminderWorker> _logger;

    public ReminderWorker(IServiceScopeFactory scopeFactory, ILogger<ReminderWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try { await ProcessAsync(stoppingToken); }
            catch (Exception ex) { _logger.LogError(ex, "Hatırlatma işçisi hatası"); }
            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
        }
    }

    private async Task ProcessAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LifeDbContext>();
        var reminderService = scope.ServiceProvider.GetRequiredService<ReminderService>();
        var pushService = scope.ServiceProvider.GetRequiredService<PushNotificationService>();
        await reminderService.EnsureUpcomingBirthdayRemindersAsync(ct);
        var due = await db.Reminders.Where(r => !r.Sent && r.ReminderAt <= DateTime.UtcNow)
            .OrderBy(r => r.ReminderAt).Take(100).ToListAsync(ct);
        foreach (var reminder in due)
        {
            var settings = await db.UserSettings.FirstOrDefaultAsync(s => s.UserId == reminder.UserId, ct);
            var notify = reminder.EntityType switch
            {
                EntityType.Task => settings?.NotifyTasks ?? true,
                EntityType.Birthday => settings?.NotifyBirthdays ?? true,
                EntityType.Contest => settings?.NotifyContests ?? true,
                _ => false
            };
            if (notify)
            {
                var (title, body, url) = await BuildPayloadAsync(db, reminder, ct);
                await pushService.SendAsync(reminder.UserId, title, body, url, ct);
            }
            reminder.Sent = true;
        }
        await db.SaveChangesAsync(ct);
    }

    private static async Task<(string Title, string Body, string Url)> BuildPayloadAsync(LifeDbContext db, Reminder reminder, CancellationToken ct)
    {
        switch (reminder.EntityType)
        {
            case EntityType.Task:
                var task = await db.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == reminder.EntityId && t.UserId == reminder.UserId, ct);
                return ("Görev hatırlatması", task?.Title ?? "Göreviniz var", "/tasks");
            case EntityType.Birthday:
                var birthday = await db.Birthdays.AsNoTracking().FirstOrDefaultAsync(b => b.Id == reminder.EntityId && b.UserId == reminder.UserId, ct);
                return ("Doğum günü hatırlatması", birthday is null ? "Doğum günü yaklaşıyor" : $"{birthday.Name} doğum günü", "/birthdays");
            case EntityType.Contest:
                var contest = await db.Contests.AsNoTracking().FirstOrDefaultAsync(c => c.Id == reminder.EntityId && c.UserId == reminder.UserId, ct);
                return ("Yarışma hatırlatması", contest?.Title ?? "Yarışma deadline yaklaşıyor", "/contests");
            default:
                return ("Hatırlatma", "Yaklaşan bir hatırlatmanız var", "/");
        }
    }
}
