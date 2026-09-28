namespace Life.Api.DTOs;

public record PushSubscribeRequest(string Endpoint, string P256dh, string Auth);
public record PushUnsubscribeRequest(string Endpoint);
public record VapidPublicKeyResponse(string PublicKey);
