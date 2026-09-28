using Life.Api.DTOs;
using Life.Api.Entities;

namespace Life.Api.Services;

public static class CategoryOptions
{
    public static readonly IReadOnlyList<string> All = new[] { "Kişisel", "İş", "Fotoğraf", "Yazılım", "Diğer" };
    public const string Default = "Kişisel";
}

public static class Mappers
{
    public static TaskDto ToDto(TaskItem entity) => new(
        entity.Id, entity.Title, entity.Description,
        entity.DueDate.HasValue ? TimeZoneHelper.FormatDate(entity.DueDate.Value) : null,
        entity.DueTime.HasValue ? TimeZoneHelper.FormatTime(entity.DueTime.Value) : null,
        entity.Priority.ToString(), entity.Category, entity.IsCompleted, entity.CreatedAt, entity.CompletedAt);

    public static BirthdayDto ToDto(Birthday entity) => new(
        entity.Id, entity.Name, entity.BirthMonth, entity.BirthDay, entity.BirthYear, entity.Note,
        entity.ReminderDaysBefore.ToList(), entity.CreatedAt);

    public static ContestDto ToDto(PhotographyContest entity) => new(
        entity.Id, entity.Title, TimeZoneHelper.FormatDate(entity.Deadline), entity.Url, entity.Description,
        entity.Status.ToString(), entity.ReminderDaysBefore.ToList(), entity.CreatedAt);

    public static BookDto ToDto(Book entity) => new(
        entity.Id, entity.Title, entity.Author, entity.Status.ToString(), entity.Rating, entity.Note,
        entity.StartedAt.HasValue ? TimeZoneHelper.FormatDate(entity.StartedAt.Value) : null,
        entity.FinishedAt.HasValue ? TimeZoneHelper.FormatDate(entity.FinishedAt.Value) : null,
        entity.CreatedAt);

    public static IdeaDto ToDto(Idea entity) => new(entity.Id, entity.Title, entity.Content, entity.CreatedAt, entity.UpdatedAt);

    public static ReminderDto ToDto(Reminder entity) => new(
        entity.Id,
        entity.EntityType switch
        {
            EntityType.Task => "task",
            EntityType.Birthday => "birthday",
            EntityType.Contest => "contest",
            _ => entity.EntityType.ToString().ToLowerInvariant()
        },
        entity.EntityId, entity.ReminderAt, entity.Sent, entity.CreatedAt);

    public static SettingsDto ToDto(UserSettings entity) => new(
        entity.TimeZone, entity.NotifyTasks, entity.NotifyBirthdays, entity.NotifyContests);
}
