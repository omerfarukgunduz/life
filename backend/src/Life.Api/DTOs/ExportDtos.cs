namespace Life.Api.DTOs;

public class ExportDataDto
{
    public int Version { get; set; } = 1;
    public List<ExportTaskDto> Tasks { get; set; } = new();
    public List<ExportBirthdayDto> Birthdays { get; set; } = new();
    public List<ExportContestDto> Contests { get; set; } = new();
    public List<ExportBookDto> Books { get; set; } = new();
    public List<ExportIdeaDto> Ideas { get; set; } = new();
    public List<ExportPushSubscriptionDto>? PushSubscriptions { get; set; }
}

public class ExportTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DueDate { get; set; }
    public string? DueTime { get; set; }
    public string Priority { get; set; } = "Normal";
    public string Category { get; set; } = "Kişisel";
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ExportBirthdayDto
{
    public string Name { get; set; } = string.Empty;
    public int BirthMonth { get; set; }
    public int BirthDay { get; set; }
    public int? BirthYear { get; set; }
    public string? Note { get; set; }
    public List<int> ReminderDaysBefore { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ExportContestDto
{
    public string Title { get; set; } = string.Empty;
    public string Deadline { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "Interested";
    public List<int> ReminderDaysBefore { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ExportBookDto
{
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Status { get; set; } = "WantToRead";
    public int? Rating { get; set; }
    public string? Note { get; set; }
    public string? StartedAt { get; set; }
    public string? FinishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ExportIdeaDto
{
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ExportPushSubscriptionDto
{
    public string Endpoint { get; set; } = string.Empty;
    public string P256dh { get; set; } = string.Empty;
    public string Auth { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
