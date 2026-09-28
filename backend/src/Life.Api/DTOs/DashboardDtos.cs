namespace Life.Api.DTOs;

public record UpcomingItemDto(
    string Date,
    string Type,
    string Title,
    string? Subtitle,
    Guid EntityId);

public record DashboardDto(
    IReadOnlyList<TaskDto> TodayTasks,
    IReadOnlyList<UpcomingItemDto> Upcoming,
    BookDto? ReadingBook);

public record CalendarItemDto(
    string Date,
    string? Time,
    string Type,
    string Title,
    Guid EntityId);

public record HealthResponse(string Status);
