namespace Life.Api.Entities;

public class CustomCollectionItem
{
    public Guid Id { get; set; }
    public Guid CustomCollectionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public CustomCollection Collection { get; set; } = null!;
}
