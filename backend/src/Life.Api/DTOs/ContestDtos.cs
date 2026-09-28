namespace Life.Api.DTOs;

public record ContestDto(
    Guid Id,
    string Title,
    string Deadline,
    string? Url,
    string? Description,
    string Status,
    IReadOnlyList<int> ReminderDaysBefore,
    DateTime CreatedAt);

public record CreateContestRequest(
    string Title,
    string Deadline,
    string? Url,
    string? Description,
    string? Status,
    IReadOnlyList<int>? ReminderDaysBefore);

public record UpdateContestRequest(
    string Title,
    string Deadline,
    string? Url,
    string? Description,
    string? Status,
    IReadOnlyList<int>? ReminderDaysBefore);
