namespace Life.Api.DTOs;

public record SettingsDto(
    string TimeZone,
    bool NotifyTasks,
    bool NotifyBirthdays,
    bool NotifyContests);

public record UpdateSettingsRequest(
    string TimeZone,
    bool NotifyTasks,
    bool NotifyBirthdays,
    bool NotifyContests);
