using Life.Api.Entities;
using Life.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Data;

public static class DevSeed
{
    public static async Task RunAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
        if (!env.IsDevelopment()) return;

        var db = scope.ServiceProvider.GetRequiredService<LifeDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var reminderService = scope.ServiceProvider.GetRequiredService<ReminderService>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
        if (await db.Users.AnyAsync()) return;

        var email = configuration["Seed:Email"] ?? "dev@life.local";
        var password = configuration["Seed:Password"] ?? "DevLife-2026!";
        var user = new User { Id = Guid.NewGuid(), Email = email, CreatedAt = DateTime.UtcNow };
        user.PasswordHash = hasher.HashPassword(user, password);
        var settings = new UserSettings
        {
            UserId = user.Id, TimeZone = TimeZoneHelper.DefaultTimeZone,
            NotifyTasks = true, NotifyBirthdays = true, NotifyContests = true
        };
        var tz = TimeZoneHelper.Resolve(settings.TimeZone);
        var today = TimeZoneHelper.TodayIn(tz);

        var task1 = new TaskItem { Id = Guid.NewGuid(), UserId = user.Id, Title = "Fotoğrafları düzenle", DueDate = today, Priority = Priority.Normal, Category = "Fotoğraf", CreatedAt = DateTime.UtcNow };
        var task2 = new TaskItem { Id = Guid.NewGuid(), UserId = user.Id, Title = "GitHub reposunu güncelle", DueDate = today.AddDays(3), Priority = Priority.Normal, Category = "Yazılım", CreatedAt = DateTime.UtcNow };
        var birthday = new Birthday { Id = Guid.NewGuid(), UserId = user.Id, Name = "Ahmet", BirthMonth = 10, BirthDay = 12, ReminderDaysBefore = new List<int> { 0, 1 }, CreatedAt = DateTime.UtcNow };
        var contest = new PhotographyContest { Id = Guid.NewGuid(), UserId = user.Id, Title = "Ara Güler Fotoğraf Yarışması", Deadline = today.AddDays(14), Url = "https://example.com", Status = ContestStatus.Interested, ReminderDaysBefore = new List<int> { 7, 1 }, CreatedAt = DateTime.UtcNow };
        var book = new Book { Id = Guid.NewGuid(), UserId = user.Id, Title = "İvan İlyiç'in Ölümü", Author = "Lev Tolstoy", Status = BookStatus.Reading, Rating = 4, CreatedAt = DateTime.UtcNow };
        var idea = new Idea { Id = Guid.NewGuid(), UserId = user.Id, Title = "Servis takip uygulaması", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };

        db.Users.Add(user); db.UserSettings.Add(settings);
        db.Tasks.AddRange(task1, task2); db.Birthdays.Add(birthday); db.Contests.Add(contest);
        db.Books.Add(book); db.Ideas.Add(idea);
        await db.SaveChangesAsync();
        await reminderService.RefreshTaskRemindersAsync(task1, settings.TimeZone, settings.ReminderTime);
        await reminderService.RefreshTaskRemindersAsync(task2, settings.TimeZone, settings.ReminderTime);
        await reminderService.RefreshBirthdayRemindersAsync(birthday, settings.TimeZone, settings.ReminderTime);
        await reminderService.RefreshContestRemindersAsync(contest, settings.TimeZone, settings.ReminderTime);
        await db.SaveChangesAsync();
    }
}
