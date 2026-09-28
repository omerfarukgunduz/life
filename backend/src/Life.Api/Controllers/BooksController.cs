using Life.Api.Auth;
using Life.Api.Data;
using Life.Api.DTOs;
using Life.Api.Entities;
using Life.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly LifeDbContext _db;
    public BooksController(LifeDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BookDto>>> List([FromQuery] string? status, CancellationToken ct)
    {
        var query = _db.Books.AsNoTracking().Where(b => b.UserId == User.GetUserId());
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<BookStatus>(status, true, out var bookStatus))
            query = query.Where(b => b.Status == bookStatus);
        var items = await query.OrderByDescending(b => b.CreatedAt).ToListAsync(ct);
        return Ok(items.Select(Mappers.ToDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookDto>> Get(Guid id, CancellationToken ct)
    {
        var entity = await _db.Books.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id && b.UserId == User.GetUserId(), ct);
        return entity is null ? NotFound() : Ok(Mappers.ToDto(entity));
    }

    [HttpPost]
    public async Task<ActionResult<BookDto>> Create([FromBody] CreateBookRequest request, CancellationToken ct)
    {
        var status = BookStatus.WantToRead;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse(request.Status, true, out BookStatus s)) status = s;
        var entity = new Book
        {
            Id = Guid.NewGuid(), UserId = User.GetUserId(), Title = request.Title.Trim(), Author = request.Author.Trim(),
            Status = status, Rating = request.Rating, Note = request.Note,
            StartedAt = TimeZoneHelper.TryParseDate(request.StartedAt, out var st) ? st : null,
            FinishedAt = TimeZoneHelper.TryParseDate(request.FinishedAt, out var fi) ? fi : null,
            CreatedAt = DateTime.UtcNow
        };
        _db.Books.Add(entity);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, Mappers.ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BookDto>> Update(Guid id, [FromBody] UpdateBookRequest request, CancellationToken ct)
    {
        var entity = await _db.Books.FirstOrDefaultAsync(b => b.Id == id && b.UserId == User.GetUserId(), ct);
        if (entity is null) return NotFound();
        entity.Title = request.Title.Trim(); entity.Author = request.Author.Trim();
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse(request.Status, true, out BookStatus s)) entity.Status = s;
        entity.Rating = request.Rating; entity.Note = request.Note;
        entity.StartedAt = string.IsNullOrWhiteSpace(request.StartedAt) ? null : (TimeZoneHelper.TryParseDate(request.StartedAt, out var st) ? st : entity.StartedAt);
        entity.FinishedAt = string.IsNullOrWhiteSpace(request.FinishedAt) ? null : (TimeZoneHelper.TryParseDate(request.FinishedAt, out var fi) ? fi : entity.FinishedAt);
        await _db.SaveChangesAsync(ct);
        return Ok(Mappers.ToDto(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var entity = await _db.Books.FirstOrDefaultAsync(b => b.Id == id && b.UserId == User.GetUserId(), ct);
        if (entity is null) return NotFound();
        _db.Books.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
