using System.Text.Json;
using Life.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Life.Api.Configurations;

public class BirthdayConfiguration : IEntityTypeConfiguration<Birthday>
{
    private static readonly JsonSerializerOptions JsonOptions = new();

    public void Configure(EntityTypeBuilder<Birthday> builder)
    {
        builder.ToTable("Birthdays");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Note).HasMaxLength(2000);
        builder.Property(x => x.ReminderDaysBefore)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<int>>(v, JsonOptions) ?? new List<int>())
            .Metadata.SetValueComparer(new ValueComparer<List<int>>(
                (a, b) => (a ?? new List<int>()).SequenceEqual(b ?? new List<int>()),
                v => v.Aggregate(0, (h, i) => HashCode.Combine(h, i)),
                v => v.ToList()));
        builder.HasIndex(x => x.UserId);
        builder.HasOne(x => x.User)
            .WithMany(x => x.Birthdays)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
