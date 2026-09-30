namespace Life.Api.Entities;

public class UserSettings
{
    public Guid UserId { get; set; }
    public string TimeZone { get; set; } = "Europe/Istanbul";
    public bool NotifyTasks { get; set; } = true;
    public bool NotifyBirthdays { get; set; } = true;
    public bool NotifyContests { get; set; } = true;
    public TimeOnly ReminderTime { get; set; } = new(9, 0);

    public User User { get; set; } = null!;
}
