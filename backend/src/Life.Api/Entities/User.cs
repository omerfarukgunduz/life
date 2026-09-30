namespace Life.Api.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public UserSettings? Settings { get; set; }
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<Birthday> Birthdays { get; set; } = new List<Birthday>();
    public ICollection<PhotographyContest> Contests { get; set; } = new List<PhotographyContest>();
    public ICollection<Book> Books { get; set; } = new List<Book>();
    public ICollection<Idea> Ideas { get; set; } = new List<Idea>();
    public ICollection<CustomCollection> CustomCollections { get; set; } = new List<CustomCollection>();
    public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
    public ICollection<PushSubscription> PushSubscriptions { get; set; } = new List<PushSubscription>();
}
