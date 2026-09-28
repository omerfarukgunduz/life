using System.Net;
using System.Text.Json;
using Life.Api.Data;
using Microsoft.EntityFrameworkCore;
using WebPush;

namespace Life.Api.Services;

public class PushNotificationService
{
    private readonly LifeDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PushNotificationService> _logger;

    public PushNotificationService(LifeDbContext db, IConfiguration configuration, ILogger<PushNotificationService> logger)
    {
        _db = db; _configuration = configuration; _logger = logger;
    }

    public async Task SendAsync(Guid userId, string title, string body, string url, CancellationToken ct = default)
    {
        var publicKey = _configuration["Push:PublicKey"] ?? _configuration["Vapid:PublicKey"];
        var privateKey = _configuration["Push:PrivateKey"] ?? _configuration["Vapid:PrivateKey"];
        var subject = _configuration["Push:Subject"]
            ?? _configuration["Vapid:Subject"]
            ?? "mailto:dev@life.local";
        if (string.IsNullOrWhiteSpace(publicKey) || string.IsNullOrWhiteSpace(privateKey))
        {
            _logger.LogWarning("VAPID anahtarları yapılandırılmamış; push atlandı.");
            return;
        }
        var subscriptions = await _db.PushSubscriptions.Where(s => s.UserId == userId).ToListAsync(ct);
        if (subscriptions.Count == 0) return;
        var client = new WebPushClient();
        var vapid = new VapidDetails(subject, publicKey, privateKey);
        var payload = JsonSerializer.Serialize(new { title, body, url });
        foreach (var subscription in subscriptions)
        {
            var pushSubscription = new WebPush.PushSubscription(subscription.Endpoint, subscription.P256dh, subscription.Auth);
            try { await client.SendNotificationAsync(pushSubscription, payload, vapid); }
            catch (WebPushException ex) when (ex.StatusCode is HttpStatusCode.Gone or HttpStatusCode.NotFound)
            { _db.PushSubscriptions.Remove(subscription); }
            catch (Exception ex) { _logger.LogWarning(ex, "Push gönderimi başarısız: {Endpoint}", subscription.Endpoint); }
        }
        await _db.SaveChangesAsync(ct);
    }
}
