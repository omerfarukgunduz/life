using Life.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Life.Api.Configurations;

public class ReminderConfiguration : IEntityTypeConfiguration<Reminder>
{
    public void Configure(EntityTypeBuilder<Reminder> builder)
    {
        builder.ToTable("Reminders");
        builder.HasKey(x => x.Id);

        var converter = new ValueConverter<EntityType, string>(
            v => ToDb(v),
            v => FromDb(v));

        builder.Property(x => x.EntityType)
            .HasConversion(converter)
            .HasMaxLength(32)
            .IsRequired();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => new { x.Sent, x.ReminderAt });
        builder.HasOne(x => x.User)
            .WithMany(x => x.Reminders)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static string ToDb(EntityType value)
    {
        return value switch
        {
            EntityType.Task => "task",
            EntityType.Birthday => "birthday",
            EntityType.Contest => "contest",
            _ => value.ToString().ToLowerInvariant()
        };
    }

    private static EntityType FromDb(string value)
    {
        return value.ToLowerInvariant() switch
        {
            "task" => EntityType.Task,
            "birthday" => EntityType.Birthday,
            "contest" => EntityType.Contest,
            _ => throw new ArgumentOutOfRangeException(nameof(value), value, null)
        };
    }
}
