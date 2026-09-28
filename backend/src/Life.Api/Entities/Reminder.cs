namespace Life.Api.Entities;

public class Reminder
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public EntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public DateTime ReminderAt { get; set; }
    public bool Sent { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}
