using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Life.Api.Validation;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "İşlenmeyen hata");
        var (status, title) = exception switch
        {
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Yetkisiz"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Bulunamadı"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Geçersiz istek"),
            InvalidOperationException => (StatusCodes.Status400BadRequest, "Geçersiz işlem"),
            _ => (StatusCodes.Status500InternalServerError, "Sunucu hatası")
        };
        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = _env.IsDevelopment() ? exception.Message : null,
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
        };
        httpContext.Response.StatusCode = status;
        httpContext.Response.ContentType = "application/problem+json";
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
