namespace Life.Api.DTOs;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password);
public record AuthResponse(string Token, string Email, Guid UserId);
public record MeResponse(Guid Id, string Email, DateTime CreatedAt);
