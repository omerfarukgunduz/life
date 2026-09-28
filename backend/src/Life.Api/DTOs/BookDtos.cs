namespace Life.Api.DTOs;

public record BookDto(
    Guid Id,
    string Title,
    string Author,
    string Status,
    int? Rating,
    string? Note,
    string? StartedAt,
    string? FinishedAt,
    DateTime CreatedAt);

public record CreateBookRequest(
    string Title,
    string Author,
    string? Status,
    int? Rating,
    string? Note,
    string? StartedAt,
    string? FinishedAt);

public record UpdateBookRequest(
    string Title,
    string Author,
    string? Status,
    int? Rating,
    string? Note,
    string? StartedAt,
    string? FinishedAt);
