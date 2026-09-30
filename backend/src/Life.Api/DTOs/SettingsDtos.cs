namespace Life.Api.DTOs;

public record SettingsDto(
    string TimeZone,
    bool NotifyTasks,
    bool NotifyBirthdays,
    bool NotifyContests,
    string ReminderTime);

public record UpdateSettingsRequest(
    string TimeZone,
    bool NotifyTasks,
    bool NotifyBirthdays,
    bool NotifyContests,
    string ReminderTime);
