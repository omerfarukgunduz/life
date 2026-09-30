using Life.Api.Auth;
using Life.Api.Data;
using Life.Api.DTOs;
using Life.Api.Entities;
using Life.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly LifeDbContext _db;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly JwtTokenService _jwt;
    private readonly IConfiguration _configuration;

    public AuthController(LifeDbContext db, IPasswordHasher<User> passwordHasher, JwtTokenService jwt, IConfiguration configuration)
    {
        _db = db; _passwordHasher = passwordHasher; _jwt = jwt; _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user is null) return Unauthorized(Problem("E-posta veya parola hatalı."));
        if (_passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            return Unauthorized(Problem("E-posta veya parola hatalı."));
        return Ok(new AuthResponse(_jwt.CreateToken(user), user.Email, user.Id));
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var allowRegistration = _configuration.GetValue("AllowRegistration", false)
            || _configuration.GetValue("Auth:AllowRegistration", false);
        if (!allowRegistration)
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails { Status = 403, Title = "Kayıt kapalı", Detail = "Yeni kullanıcı kaydı şu anda kapalı." });
        var email = request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            return Conflict(new ProblemDetails { Status = 409, Title = "E-posta kullanımda", Detail = "Bu e-posta adresi zaten kayıtlı." });
        var user = new User { Id = Guid.NewGuid(), Email = email, CreatedAt = DateTime.UtcNow };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        _db.Users.Add(user);
        _db.UserSettings.Add(new UserSettings
        {
            UserId = user.Id,
            TimeZone = TimeZoneHelper.DefaultTimeZone,
            NotifyTasks = true,
            NotifyBirthdays = true,
            NotifyContests = true,
            ReminderTime = ReminderService.DefaultReminderTime,
        });
        await _db.SaveChangesAsync(ct);
        return Ok(new AuthResponse(_jwt.CreateToken(user), user.Email, user.Id));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> Me(CancellationToken ct)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == User.GetUserId(), ct);
        return user is null ? Unauthorized() : Ok(new MeResponse(user.Id, user.Email, user.CreatedAt));
    }

    [Authorize]
    [HttpPut("email")]
    public async Task<ActionResult<MeResponse>> ChangeEmail([FromBody] ChangeEmailRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return Unauthorized();
        if (_passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword) == PasswordVerificationResult.Failed)
            return BadRequest(new ProblemDetails { Status = 400, Title = "Parola hatalı", Detail = "Mevcut parola doğru değil." });

        var email = request.NewEmail.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email && u.Id != userId, ct))
            return Conflict(new ProblemDetails { Status = 409, Title = "E-posta kullanımda", Detail = "Bu e-posta adresi zaten kayıtlı." });

        user.Email = email;
        await _db.SaveChangesAsync(ct);
        return Ok(new MeResponse(user.Id, user.Email, user.CreatedAt));
    }

    [Authorize]
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == User.GetUserId(), ct);
        if (user is null) return Unauthorized();
        if (_passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword) == PasswordVerificationResult.Failed)
            return BadRequest(new ProblemDetails { Status = 400, Title = "Parola hatalı", Detail = "Mevcut parola doğru değil." });

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static ProblemDetails Problem(string detail) => new() { Status = 401, Title = "Yetkisiz", Detail = detail };
}
