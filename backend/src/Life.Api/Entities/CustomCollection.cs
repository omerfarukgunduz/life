using Life.Api.Services;

namespace Life.Api.Entities;

public class CustomCollection
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string IconKey { get; set; } = CustomCollectionAppearance.DefaultIconKey;
    public string ColorKey { get; set; } = CustomCollectionAppearance.DefaultColorKey;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public ICollection<CustomCollectionItem> Items { get; set; } = new List<CustomCollectionItem>();
}
