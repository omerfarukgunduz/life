namespace Life.Api.DTOs;

public record CustomCollectionDto(
    Guid Id,
    string Name,
    string? Description,
    string IconKey,
    string ColorKey,
    int ItemCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CustomCollectionItemDto(
    Guid Id,
    Guid CollectionId,
    string Title,
    string? Content,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateCustomCollectionRequest(string Name, string? Description, string? IconKey, string? ColorKey);
public record UpdateCustomCollectionRequest(string Name, string? Description, string? IconKey, string? ColorKey);
public record CreateCustomCollectionItemRequest(string Title, string? Content);
public record UpdateCustomCollectionItemRequest(string Title, string? Content);
