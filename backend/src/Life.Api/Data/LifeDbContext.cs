using Life.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Life.Api.Data;

public class LifeDbContext : DbContext
{
    public LifeDbContext(DbContextOptions<LifeDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Birthday> Birthdays => Set<Birthday>();
    public DbSet<PhotographyContest> Contests => Set<PhotographyContest>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Idea> Ideas => Set<Idea>();
    public DbSet<CustomCollection> CustomCollections => Set<CustomCollection>();
    public DbSet<CustomCollectionItem> CustomCollectionItems => Set<CustomCollectionItem>();
    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LifeDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
