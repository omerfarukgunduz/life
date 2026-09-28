namespace Life.Api.Entities;

public class Birthday
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int BirthMonth { get; set; }
    public int BirthDay { get; set; }
    public int? BirthYear { get; set; }
    public string? Note { get; set; }
    public List<int> ReminderDaysBefore { get; set; } = new() { 0, 1 };
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}
