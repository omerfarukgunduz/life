namespace Life.Api.Services;

public static class CustomCollectionAppearance
{
    public const string DefaultIconKey = "folder";
    public const string DefaultColorKey = "blue";

    public static readonly IReadOnlySet<string> IconKeys = new HashSet<string>(StringComparer.Ordinal)
    {
        "folder", "book", "star", "heart", "camera", "gift", "lightbulb", "flag",
        "music", "map", "plane", "coffee", "dumbbell", "palette", "bookmark", "archive",
    };

    public static readonly IReadOnlySet<string> ColorKeys = new HashSet<string>(StringComparer.Ordinal)
    {
        "blue", "purple", "pink", "green", "yellow", "orange", "red", "teal", "indigo",
    };

    public static string NormalizeIconKey(string? value) =>
        !string.IsNullOrWhiteSpace(value) && IconKeys.Contains(value.Trim())
            ? value.Trim()
            : DefaultIconKey;

    public static string NormalizeColorKey(string? value) =>
        !string.IsNullOrWhiteSpace(value) && ColorKeys.Contains(value.Trim())
            ? value.Trim()
            : DefaultColorKey;
}
