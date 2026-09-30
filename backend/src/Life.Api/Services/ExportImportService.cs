using Life.Api.Data;
using Life.Api.DTOs;
using Life.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Services;

public class ExportImportService
{
    private readonly LifeDbContext _db;
    private readonly ReminderService _reminderService;

    public ExportImportService(LifeDbContext db, ReminderService reminderService)
    {
        _db = db;
        _reminderService = reminderService;
    }

    public async Task<ExportDataDto> ExportAsync(Guid userId, CancellationToken ct = default)
    {
        var tasks = await _db.Tasks.AsNoTracking().Where(t => t.UserId == userId).ToListAsync(ct);
        var birthdays = await _db.Birthdays.AsNoTracking().Where(b => b.UserId == userId).ToListAsync(ct);
        var contests = await _db.Contests.AsNoTracking().Where(c => c.UserId == userId).ToListAsync(ct);
        var books = await _db.Books.AsNoTracking().Where(b => b.UserId == userId).ToListAsync(ct);
        var ideas = await _db.Ideas.AsNoTracking().Where(i => i.UserId == userId).ToListAsync(ct);
        var customCollections = await _db.CustomCollections.AsNoTracking()
            .Include(c => c.Items)
            .Where(c => c.UserId == userId)
            .ToListAsync(ct);
        var push = await _db.PushSubscriptions.AsNoTracking().Where(p => p.UserId == userId).ToListAsync(ct);

        return new ExportDataDto
        {
            Version = 1,
            Tasks = tasks.Select(t => new ExportTaskDto
            {
                Title = t.Title, Description = t.Description,
                DueDate = t.DueDate.HasValue ? TimeZoneHelper.FormatDate(t.DueDate.Value) : null,
                DueTime = t.DueTime.HasValue ? TimeZoneHelper.FormatTime(t.DueTime.Value) : null,
                Priority = t.Priority.ToString(), Category = t.Category, IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt, CompletedAt = t.CompletedAt
            }).ToList(),
            Birthdays = birthdays.Select(b => new ExportBirthdayDto
            {
                Name = b.Name, BirthMonth = b.BirthMonth, BirthDay = b.BirthDay, BirthYear = b.BirthYear,
                Note = b.Note, ReminderDaysBefore = b.ReminderDaysBefore.ToList(), CreatedAt = b.CreatedAt
            }).ToList(),
            Contests = contests.Select(c => new ExportContestDto
            {
                Title = c.Title, Deadline = TimeZoneHelper.FormatDate(c.Deadline), Url = c.Url,
                Description = c.Description, Status = c.Status.ToString(),
                ReminderDaysBefore = c.ReminderDaysBefore.ToList(), CreatedAt = c.CreatedAt
            }).ToList(),
            Books = books.Select(b => new ExportBookDto
            {
                Title = b.Title, Author = b.Author, Status = b.Status.ToString(), Rating = b.Rating, Note = b.Note,
                StartedAt = b.StartedAt.HasValue ? TimeZoneHelper.FormatDate(b.StartedAt.Value) : null,
                FinishedAt = b.FinishedAt.HasValue ? TimeZoneHelper.FormatDate(b.FinishedAt.Value) : null,
                CreatedAt = b.CreatedAt
            }).ToList(),
            Ideas = ideas.Select(i => new ExportIdeaDto
            {
                Title = i.Title, Content = i.Content, CreatedAt = i.CreatedAt, UpdatedAt = i.UpdatedAt
            }).ToList(),
            CustomCollections = customCollections.Select(c => new ExportCustomCollectionDto
            {
                Name = c.Name,
                Description = c.Description,
                IconKey = c.IconKey,
                ColorKey = c.ColorKey,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                Items = c.Items.Select(i => new ExportCustomCollectionItemDto
                {
                    Title = i.Title,
                    Content = i.Content,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                }).ToList(),
            }).ToList(),
            PushSubscriptions = push.Select(p => new ExportPushSubscriptionDto
            {
                Endpoint = p.Endpoint, P256dh = p.P256dh, Auth = p.Auth, CreatedAt = p.CreatedAt
            }).ToList()
        };
    }

    public async Task ImportAsync(Guid userId, ExportDataDto data, CancellationToken ct = default)
    {
        var settings = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId, ct);
        var timeZone = settings?.TimeZone ?? TimeZoneHelper.DefaultTimeZone;
        var reminderTime = ReminderService.ResolveReminderTime(settings?.ReminderTime);

        _db.Reminders.RemoveRange(await _db.Reminders.Where(r => r.UserId == userId).ToListAsync(ct));
        _db.Tasks.RemoveRange(await _db.Tasks.Where(t => t.UserId == userId).ToListAsync(ct));
        _db.Birthdays.RemoveRange(await _db.Birthdays.Where(b => b.UserId == userId).ToListAsync(ct));
        _db.Contests.RemoveRange(await _db.Contests.Where(c => c.UserId == userId).ToListAsync(ct));
        _db.Books.RemoveRange(await _db.Books.Where(b => b.UserId == userId).ToListAsync(ct));
        _db.Ideas.RemoveRange(await _db.Ideas.Where(i => i.UserId == userId).ToListAsync(ct));
        _db.CustomCollections.RemoveRange(await _db.CustomCollections.Where(c => c.UserId == userId).ToListAsync(ct));
        if (data.PushSubscriptions is not null)
            _db.PushSubscriptions.RemoveRange(await _db.PushSubscriptions.Where(p => p.UserId == userId).ToListAsync(ct));
        await _db.SaveChangesAsync(ct);

        var newTasks = new List<TaskItem>();
        foreach (var item in data.Tasks)
        {
            DateOnly? dueDate = TimeZoneHelper.TryParseDate(item.DueDate, out var d) ? d : null;
            TimeOnly? dueTime = TimeZoneHelper.TryParseTime(item.DueTime, out var t) ? t : null;
            Enum.TryParse<Priority>(item.Priority, true, out var priority);
            if (!Enum.IsDefined(typeof(Priority), priority)) priority = Priority.Normal;
            var category = CategoryOptions.All.Contains(item.Category) ? item.Category : CategoryOptions.Default;
            var entity = new TaskItem
            {
                Id = Guid.NewGuid(), UserId = userId, Title = item.Title, Description = item.Description,
                DueDate = dueDate, DueTime = dueTime, Priority = priority, Category = category,
                IsCompleted = item.IsCompleted,
                CreatedAt = item.CreatedAt == default ? DateTime.UtcNow : item.CreatedAt,
                CompletedAt = item.CompletedAt
            };
            newTasks.Add(entity); _db.Tasks.Add(entity);
        }

        var newBirthdays = new List<Birthday>();
        foreach (var item in data.Birthdays)
        {
            var entity = new Birthday
            {
                Id = Guid.NewGuid(), UserId = userId, Name = item.Name, BirthMonth = item.BirthMonth,
                BirthDay = item.BirthDay, BirthYear = item.BirthYear, Note = item.Note,
                ReminderDaysBefore = item.ReminderDaysBefore?.ToList() ?? new List<int>(),
                CreatedAt = item.CreatedAt == default ? DateTime.UtcNow : item.CreatedAt
            };
            newBirthdays.Add(entity); _db.Birthdays.Add(entity);
        }

        var newContests = new List<PhotographyContest>();
        foreach (var item in data.Contests)
        {
            if (!TimeZoneHelper.TryParseDate(item.Deadline, out var deadline)) continue;
            Enum.TryParse<ContestStatus>(item.Status, true, out var status);
            if (!Enum.IsDefined(typeof(ContestStatus), status)) status = ContestStatus.Interested;
            var entity = new PhotographyContest
            {
                Id = Guid.NewGuid(), UserId = userId, Title = item.Title, Deadline = deadline,
                Url = item.Url, Description = item.Description, Status = status,
                ReminderDaysBefore = item.ReminderDaysBefore?.ToList() ?? new List<int>(),
                CreatedAt = item.CreatedAt == default ? DateTime.UtcNow : item.CreatedAt
            };
            newContests.Add(entity); _db.Contests.Add(entity);
        }

        foreach (var item in data.Books)
        {
            DateOnly? startedAt = TimeZoneHelper.TryParseDate(item.StartedAt, out var s) ? s : null;
            DateOnly? finishedAt = TimeZoneHelper.TryParseDate(item.FinishedAt, out var f) ? f : null;
            Enum.TryParse<BookStatus>(item.Status, true, out var status);
            if (!Enum.IsDefined(typeof(BookStatus), status)) status = BookStatus.WantToRead;
            _db.Books.Add(new Book
            {
                Id = Guid.NewGuid(), UserId = userId, Title = item.Title, Author = item.Author,
                Status = status, Rating = item.Rating, Note = item.Note, StartedAt = startedAt,
                FinishedAt = finishedAt, CreatedAt = item.CreatedAt == default ? DateTime.UtcNow : item.CreatedAt
            });
        }

        foreach (var item in data.Ideas)
        {
            _db.Ideas.Add(new Idea
            {
                Id = Guid.NewGuid(), UserId = userId, Title = item.Title, Content = item.Content,
                CreatedAt = item.CreatedAt == default ? DateTime.UtcNow : item.CreatedAt,
                UpdatedAt = item.UpdatedAt == default ? DateTime.UtcNow : item.UpdatedAt
            });
        }

        if (data.CustomCollections is not null)
        {
            foreach (var collection in data.CustomCollections)
            {
                var createdAt = collection.CreatedAt == default ? DateTime.UtcNow : collection.CreatedAt;
                var updatedAt = collection.UpdatedAt == default ? createdAt : collection.UpdatedAt;
                var entity = new CustomCollection
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = collection.Name,
                    Description = collection.Description,
                    IconKey = CustomCollectionAppearance.NormalizeIconKey(collection.IconKey),
                    ColorKey = CustomCollectionAppearance.NormalizeColorKey(collection.ColorKey),
                    CreatedAt = createdAt,
                    UpdatedAt = updatedAt,
                };
                _db.CustomCollections.Add(entity);
                foreach (var item in collection.Items)
                {
                    _db.CustomCollectionItems.Add(new CustomCollectionItem
                    {
                        Id = Guid.NewGuid(),
                        CustomCollectionId = entity.Id,
                        Title = item.Title,
                        Content = item.Content,
                        CreatedAt = item.CreatedAt == default ? DateTime.UtcNow : item.CreatedAt,
                        UpdatedAt = item.UpdatedAt == default ? DateTime.UtcNow : item.UpdatedAt,
                    });
                }
            }
        }

        if (data.PushSubscriptions is not null)
        {
            foreach (var item in data.PushSubscriptions)
            {
                _db.PushSubscriptions.Add(new PushSubscription
                {
                    Id = Guid.NewGuid(), UserId = userId, Endpoint = item.Endpoint,
                    P256dh = item.P256dh, Auth = item.Auth,
                    CreatedAt = item.CreatedAt == default ? DateTime.UtcNow : item.CreatedAt
                });
            }
        }

        await _db.SaveChangesAsync(ct);
        foreach (var task in newTasks) await _reminderService.RefreshTaskRemindersAsync(task, timeZone, reminderTime, ct);
        foreach (var birthday in newBirthdays) await _reminderService.RefreshBirthdayRemindersAsync(birthday, timeZone, reminderTime, ct);
        foreach (var contest in newContests) await _reminderService.RefreshContestRemindersAsync(contest, timeZone, reminderTime, ct);
        await _db.SaveChangesAsync(ct);
    }
}
