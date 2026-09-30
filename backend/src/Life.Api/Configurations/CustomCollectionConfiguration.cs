using Life.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Life.Api.Configurations;

public class CustomCollectionConfiguration : IEntityTypeConfiguration<CustomCollection>
{
    public void Configure(EntityTypeBuilder<CustomCollection> builder)
    {
        builder.ToTable("CustomCollections");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.IconKey).HasMaxLength(32).IsRequired();
        builder.Property(x => x.ColorKey).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.UserId);
        builder.HasOne(x => x.User)
            .WithMany(x => x.CustomCollections)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class CustomCollectionItemConfiguration : IEntityTypeConfiguration<CustomCollectionItem>
{
    public void Configure(EntityTypeBuilder<CustomCollectionItem> builder)
    {
        builder.ToTable("CustomCollectionItems");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Content).HasMaxLength(8000);
        builder.HasIndex(x => x.CustomCollectionId);
        builder.HasOne(x => x.Collection)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.CustomCollectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
