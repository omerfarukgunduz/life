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
[Route("api/ideas")]
public class IdeasController : ControllerBase
{
    private readonly LifeDbContext _db;
    public IdeasController(LifeDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<IdeaDto>>> List(CancellationToken ct)
    {
        var items = await _db.Ideas.AsNoTracking().Where(i => i.UserId == User.GetUserId()).OrderByDescending(i => i.CreatedAt).ToListAsync(ct);
        return Ok(items.Select(Mappers.ToDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IdeaDto>> Get(Guid id, CancellationToken ct)
    {
        var entity = await _db.Ideas.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id && i.UserId == User.GetUserId(), ct);
        return entity is null ? NotFound() : Ok(Mappers.ToDto(entity));
    }

    [HttpPost]
    public async Task<ActionResult<IdeaDto>> Create([FromBody] CreateIdeaRequest request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var entity = new Idea { Id = Guid.NewGuid(), UserId = User.GetUserId(), Title = request.Title.Trim(), Content = request.Content, CreatedAt = now, UpdatedAt = now };
        _db.Ideas.Add(entity);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, Mappers.ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<IdeaDto>> Update(Guid id, [FromBody] UpdateIdeaRequest request, CancellationToken ct)
    {
        var entity = await _db.Ideas.FirstOrDefaultAsync(i => i.Id == id && i.UserId == User.GetUserId(), ct);
        if (entity is null) return NotFound();
        entity.Title = request.Title.Trim(); entity.Content = request.Content; entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Ok(Mappers.ToDto(entity));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var entity = await _db.Ideas.FirstOrDefaultAsync(i => i.Id == id && i.UserId == User.GetUserId(), ct);
        if (entity is null) return NotFound();
        _db.Ideas.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
