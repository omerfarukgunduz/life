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
[Route("api/custom-collections")]
public class CustomCollectionsController : ControllerBase
{
    private readonly LifeDbContext _db;

    public CustomCollectionsController(LifeDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomCollectionDto>>> List(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var collections = await _db.CustomCollections.AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => new CustomCollectionDto(
                c.Id,
                c.Name,
                c.Description,
                c.IconKey,
                c.ColorKey,
                c.Items.Count,
                c.CreatedAt,
                c.UpdatedAt))
            .ToListAsync(ct);
        return Ok(collections);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomCollectionDto>> Get(Guid id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var entity = await _db.CustomCollections.AsNoTracking()
            .Where(c => c.Id == id && c.UserId == userId)
            .Select(c => new CustomCollectionDto(
                c.Id,
                c.Name,
                c.Description,
                c.IconKey,
                c.ColorKey,
                c.Items.Count,
                c.CreatedAt,
                c.UpdatedAt))
            .FirstOrDefaultAsync(ct);
        return entity is null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    public async Task<ActionResult<CustomCollectionDto>> Create(
        [FromBody] CreateCustomCollectionRequest request,
        CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var entity = new CustomCollection
        {
            Id = Guid.NewGuid(),
            UserId = User.GetUserId(),
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            IconKey = CustomCollectionAppearance.NormalizeIconKey(request.IconKey),
            ColorKey = CustomCollectionAppearance.NormalizeColorKey(request.ColorKey),
            CreatedAt = now,
            UpdatedAt = now,
        };
        _db.CustomCollections.Add(entity);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, Mappers.ToDto(entity, 0));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomCollectionDto>> Update(
        Guid id,
        [FromBody] UpdateCustomCollectionRequest request,
        CancellationToken ct)
    {
        var entity = await _db.CustomCollections
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == User.GetUserId(), ct);
        if (entity is null) return NotFound();
        entity.Name = request.Name.Trim();
        entity.Description = string.IsNullOrWhiteSpace(request.Description)
            ? null
            : request.Description.Trim();
        entity.IconKey = CustomCollectionAppearance.NormalizeIconKey(request.IconKey);
        entity.ColorKey = CustomCollectionAppearance.NormalizeColorKey(request.ColorKey);
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Ok(Mappers.ToDto(entity, entity.Items.Count));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var entity = await _db.CustomCollections
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == User.GetUserId(), ct);
        if (entity is null) return NotFound();
        _db.CustomCollections.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("{collectionId:guid}/items")]
    public async Task<ActionResult<IReadOnlyList<CustomCollectionItemDto>>> ListItems(
        Guid collectionId,
        CancellationToken ct)
    {
        if (!await OwnsCollection(collectionId, ct)) return NotFound();
        var items = await _db.CustomCollectionItems.AsNoTracking()
            .Where(i => i.CustomCollectionId == collectionId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);
        return Ok(items.Select(Mappers.ToDto).ToList());
    }

    [HttpPost("{collectionId:guid}/items")]
    public async Task<ActionResult<CustomCollectionItemDto>> CreateItem(
        Guid collectionId,
        [FromBody] CreateCustomCollectionItemRequest request,
        CancellationToken ct)
    {
        var collection = await _db.CustomCollections
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == User.GetUserId(), ct);
        if (collection is null) return NotFound();
        var now = DateTime.UtcNow;
        var entity = new CustomCollectionItem
        {
            Id = Guid.NewGuid(),
            CustomCollectionId = collectionId,
            Title = request.Title.Trim(),
            Content = request.Content,
            CreatedAt = now,
            UpdatedAt = now,
        };
        _db.CustomCollectionItems.Add(entity);
        collection.UpdatedAt = now;
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(ListItems), new { collectionId }, Mappers.ToDto(entity));
    }

    [HttpPut("{collectionId:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<CustomCollectionItemDto>> UpdateItem(
        Guid collectionId,
        Guid itemId,
        [FromBody] UpdateCustomCollectionItemRequest request,
        CancellationToken ct)
    {
        if (!await OwnsCollection(collectionId, ct)) return NotFound();
        var entity = await _db.CustomCollectionItems
            .FirstOrDefaultAsync(i => i.Id == itemId && i.CustomCollectionId == collectionId, ct);
        if (entity is null) return NotFound();
        entity.Title = request.Title.Trim();
        entity.Content = request.Content;
        entity.UpdatedAt = DateTime.UtcNow;
        var collection = await _db.CustomCollections.FindAsync([collectionId], ct);
        if (collection is not null) collection.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Ok(Mappers.ToDto(entity));
    }

    [HttpDelete("{collectionId:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> DeleteItem(Guid collectionId, Guid itemId, CancellationToken ct)
    {
        if (!await OwnsCollection(collectionId, ct)) return NotFound();
        var entity = await _db.CustomCollectionItems
            .FirstOrDefaultAsync(i => i.Id == itemId && i.CustomCollectionId == collectionId, ct);
        if (entity is null) return NotFound();
        _db.CustomCollectionItems.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private Task<bool> OwnsCollection(Guid collectionId, CancellationToken ct) =>
        _db.CustomCollections.AnyAsync(
            c => c.Id == collectionId && c.UserId == User.GetUserId(),
            ct);
}
