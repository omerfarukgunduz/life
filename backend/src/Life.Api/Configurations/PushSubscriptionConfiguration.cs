using Life.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Life.Api.Configurations;

public class PushSubscriptionConfiguration : IEntityTypeConfiguration<PushSubscription>
{
    public void Configure(EntityTypeBuilder<PushSubscription> builder)
    {
        builder.ToTable("PushSubscriptions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Endpoint).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.P256dh).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Auth).HasMaxLength(500).IsRequired();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.Endpoint);
        builder.HasOne(x => x.User)
            .WithMany(x => x.PushSubscriptions)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
