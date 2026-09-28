namespace Life.Api.DTOs;

public record ReminderDto(
    Guid Id,
    string EntityType,
    Guid EntityId,
    DateTime ReminderAt,
    bool Sent,
    DateTime CreatedAt);
