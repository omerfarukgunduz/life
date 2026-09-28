namespace Life.Api.DTOs;

public record TaskDto(
    Guid Id,
    string Title,
    string? Description,
    string? DueDate,
    string? DueTime,
    string Priority,
    string Category,
    bool IsCompleted,
    DateTime CreatedAt,
    DateTime? CompletedAt);

public record CreateTaskRequest(
    string Title,
    string? Description,
    string? DueDate,
    string? DueTime,
    string? Priority,
    string? Category,
    bool? IsCompleted);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    string? DueDate,
    string? DueTime,
    string? Priority,
    string? Category,
    bool? IsCompleted);
