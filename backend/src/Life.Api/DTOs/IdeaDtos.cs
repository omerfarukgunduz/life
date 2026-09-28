namespace Life.Api.DTOs;

public record IdeaDto(
    Guid Id,
    string Title,
    string? Content,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateIdeaRequest(string Title, string? Content);
public record UpdateIdeaRequest(string Title, string? Content);
