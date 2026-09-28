namespace Life.Api.DTOs;

public record BirthdayDto(
    Guid Id,
    string Name,
    int BirthMonth,
    int BirthDay,
    int? BirthYear,
    string? Note,
    IReadOnlyList<int> ReminderDaysBefore,
    DateTime CreatedAt);

public record CreateBirthdayRequest(
    string Name,
    int BirthMonth,
    int BirthDay,
    int? BirthYear,
    string? Note,
    IReadOnlyList<int>? ReminderDaysBefore);

public record UpdateBirthdayRequest(
    string Name,
    int BirthMonth,
    int BirthDay,
    int? BirthYear,
    string? Note,
    IReadOnlyList<int>? ReminderDaysBefore);
