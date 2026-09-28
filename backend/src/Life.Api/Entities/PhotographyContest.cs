namespace Life.Api.Entities;

public class PhotographyContest
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateOnly Deadline { get; set; }
    public string? Url { get; set; }
    public string? Description { get; set; }
    public ContestStatus Status { get; set; } = ContestStatus.Interested;
    public List<int> ReminderDaysBefore { get; set; } = new() { 7, 1 };
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}
