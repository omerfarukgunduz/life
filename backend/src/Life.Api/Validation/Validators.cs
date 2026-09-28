using FluentValidation;
using Life.Api.DTOs;
using Life.Api.Services;

namespace Life.Api.Validation;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().WithMessage("E-posta zorunludur.").EmailAddress().WithMessage("Geçerli bir e-posta girin.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Parola zorunludur.");
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().WithMessage("E-posta zorunludur.").EmailAddress().WithMessage("Geçerli bir e-posta girin.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Parola zorunludur.").MinimumLength(8).WithMessage("Parola en az 8 karakter olmalıdır.");
    }
}

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Başlık zorunludur.").MaximumLength(500).WithMessage("Başlık en fazla 500 karakter olabilir.");
        RuleFor(x => x.Priority).Must(p => string.IsNullOrWhiteSpace(p) || p is "Low" or "Normal" or "High").WithMessage("Öncelik Low, Normal veya High olmalıdır.");
        RuleFor(x => x.Category).Must(c => string.IsNullOrWhiteSpace(c) || CategoryOptions.All.Contains(c)).WithMessage("Kategori geçersiz.");
        RuleFor(x => x.DueDate).Must(d => string.IsNullOrWhiteSpace(d) || TimeZoneHelper.TryParseDate(d, out _)).WithMessage("Son tarih yyyy-MM-dd formatında olmalıdır.");
        RuleFor(x => x.DueTime).Must(t => string.IsNullOrWhiteSpace(t) || TimeZoneHelper.TryParseTime(t, out _)).WithMessage("Saat HH:mm formatında olmalıdır.");
    }
}

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Başlık zorunludur.").MaximumLength(500).WithMessage("Başlık en fazla 500 karakter olabilir.");
        RuleFor(x => x.Priority).Must(p => string.IsNullOrWhiteSpace(p) || p is "Low" or "Normal" or "High").WithMessage("Öncelik Low, Normal veya High olmalıdır.");
        RuleFor(x => x.Category).Must(c => string.IsNullOrWhiteSpace(c) || CategoryOptions.All.Contains(c)).WithMessage("Kategori geçersiz.");
        RuleFor(x => x.DueDate).Must(d => string.IsNullOrWhiteSpace(d) || TimeZoneHelper.TryParseDate(d, out _)).WithMessage("Son tarih yyyy-MM-dd formatında olmalıdır.");
        RuleFor(x => x.DueTime).Must(t => string.IsNullOrWhiteSpace(t) || TimeZoneHelper.TryParseTime(t, out _)).WithMessage("Saat HH:mm formatında olmalıdır.");
    }
}

public class CreateBirthdayRequestValidator : AbstractValidator<CreateBirthdayRequest>
{
    private static readonly int[] Allowed = { 0, 1, 3, 7 };
    public CreateBirthdayRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("İsim zorunludur.");
        RuleFor(x => x.BirthMonth).InclusiveBetween(1, 12).WithMessage("Ay 1-12 arasında olmalıdır.");
        RuleFor(x => x.BirthDay).InclusiveBetween(1, 31).WithMessage("Gün 1-31 arasında olmalıdır.");
        RuleFor(x => x.BirthYear).Must(y => !y.HasValue || (y.Value >= 1900 && y.Value <= DateTime.UtcNow.Year)).WithMessage("Yıl geçersiz.");
        RuleFor(x => x.ReminderDaysBefore).Must(days => days is null || days.All(d => Allowed.Contains(d))).WithMessage("Doğum günü hatırlatma günleri 0, 1, 3 veya 7 olabilir.");
    }
}

public class UpdateBirthdayRequestValidator : AbstractValidator<UpdateBirthdayRequest>
{
    private static readonly int[] Allowed = { 0, 1, 3, 7 };
    public UpdateBirthdayRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("İsim zorunludur.");
        RuleFor(x => x.BirthMonth).InclusiveBetween(1, 12).WithMessage("Ay 1-12 arasında olmalıdır.");
        RuleFor(x => x.BirthDay).InclusiveBetween(1, 31).WithMessage("Gün 1-31 arasında olmalıdır.");
        RuleFor(x => x.BirthYear).Must(y => !y.HasValue || (y.Value >= 1900 && y.Value <= DateTime.UtcNow.Year)).WithMessage("Yıl geçersiz.");
        RuleFor(x => x.ReminderDaysBefore).Must(days => days is null || days.All(d => Allowed.Contains(d))).WithMessage("Doğum günü hatırlatma günleri 0, 1, 3 veya 7 olabilir.");
    }
}

public class CreateContestRequestValidator : AbstractValidator<CreateContestRequest>
{
    private static readonly int[] Allowed = { 30, 7, 1 };
    public CreateContestRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Başlık zorunludur.");
        RuleFor(x => x.Deadline).NotEmpty().WithMessage("Deadline zorunludur.").Must(d => TimeZoneHelper.TryParseDate(d, out _)).WithMessage("Deadline yyyy-MM-dd formatında olmalıdır.");
        RuleFor(x => x.Status).Must(s => string.IsNullOrWhiteSpace(s) || s is "Interested" or "Applied" or "Completed").WithMessage("Durum Interested, Applied veya Completed olmalıdır.");
        RuleFor(x => x.ReminderDaysBefore).Must(days => days is null || days.All(d => Allowed.Contains(d))).WithMessage("Yarışma hatırlatma günleri 30, 7 veya 1 olabilir.");
    }
}

public class UpdateContestRequestValidator : AbstractValidator<UpdateContestRequest>
{
    private static readonly int[] Allowed = { 30, 7, 1 };
    public UpdateContestRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Başlık zorunludur.");
        RuleFor(x => x.Deadline).NotEmpty().WithMessage("Deadline zorunludur.").Must(d => TimeZoneHelper.TryParseDate(d, out _)).WithMessage("Deadline yyyy-MM-dd formatında olmalıdır.");
        RuleFor(x => x.Status).Must(s => string.IsNullOrWhiteSpace(s) || s is "Interested" or "Applied" or "Completed").WithMessage("Durum Interested, Applied veya Completed olmalıdır.");
        RuleFor(x => x.ReminderDaysBefore).Must(days => days is null || days.All(d => Allowed.Contains(d))).WithMessage("Yarışma hatırlatma günleri 30, 7 veya 1 olabilir.");
    }
}

public class CreateBookRequestValidator : AbstractValidator<CreateBookRequest>
{
    public CreateBookRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Başlık zorunludur.");
        RuleFor(x => x.Author).NotEmpty().WithMessage("Yazar zorunludur.");
        RuleFor(x => x.Status).Must(s => string.IsNullOrWhiteSpace(s) || s is "Reading" or "WantToRead" or "Read").WithMessage("Durum Reading, WantToRead veya Read olmalıdır.");
        RuleFor(x => x.Rating).Must(r => !r.HasValue || (r.Value >= 1 && r.Value <= 5)).WithMessage("Puan 1-5 arasında olmalıdır.");
        RuleFor(x => x.StartedAt).Must(d => string.IsNullOrWhiteSpace(d) || TimeZoneHelper.TryParseDate(d, out _)).WithMessage("Başlangıç tarihi yyyy-MM-dd formatında olmalıdır.");
        RuleFor(x => x.FinishedAt).Must(d => string.IsNullOrWhiteSpace(d) || TimeZoneHelper.TryParseDate(d, out _)).WithMessage("Bitiş tarihi yyyy-MM-dd formatında olmalıdır.");
    }
}

public class UpdateBookRequestValidator : AbstractValidator<UpdateBookRequest>
{
    public UpdateBookRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Başlık zorunludur.");
        RuleFor(x => x.Author).NotEmpty().WithMessage("Yazar zorunludur.");
        RuleFor(x => x.Status).Must(s => string.IsNullOrWhiteSpace(s) || s is "Reading" or "WantToRead" or "Read").WithMessage("Durum Reading, WantToRead veya Read olmalıdır.");
        RuleFor(x => x.Rating).Must(r => !r.HasValue || (r.Value >= 1 && r.Value <= 5)).WithMessage("Puan 1-5 arasında olmalıdır.");
        RuleFor(x => x.StartedAt).Must(d => string.IsNullOrWhiteSpace(d) || TimeZoneHelper.TryParseDate(d, out _)).WithMessage("Başlangıç tarihi yyyy-MM-dd formatında olmalıdır.");
        RuleFor(x => x.FinishedAt).Must(d => string.IsNullOrWhiteSpace(d) || TimeZoneHelper.TryParseDate(d, out _)).WithMessage("Bitiş tarihi yyyy-MM-dd formatında olmalıdır.");
    }
}

public class CreateIdeaRequestValidator : AbstractValidator<CreateIdeaRequest>
{
    public CreateIdeaRequestValidator() { RuleFor(x => x.Title).NotEmpty().WithMessage("Başlık zorunludur."); }
}

public class UpdateIdeaRequestValidator : AbstractValidator<UpdateIdeaRequest>
{
    public UpdateIdeaRequestValidator() { RuleFor(x => x.Title).NotEmpty().WithMessage("Başlık zorunludur."); }
}

public class UpdateSettingsRequestValidator : AbstractValidator<UpdateSettingsRequest>
{
    public UpdateSettingsRequestValidator()
    {
        RuleFor(x => x.TimeZone).NotEmpty().WithMessage("Saat dilimi zorunludur.").Must(IsValidTimeZone).WithMessage("Geçerli bir IANA saat dilimi girin.");
    }
    private static bool IsValidTimeZone(string timeZone)
    {
        try { TimeZoneInfo.FindSystemTimeZoneById(timeZone); return true; }
        catch { return false; }
    }
}

public class PushSubscribeRequestValidator : AbstractValidator<PushSubscribeRequest>
{
    public PushSubscribeRequestValidator()
    {
        RuleFor(x => x.Endpoint).NotEmpty().WithMessage("Endpoint zorunludur.");
        RuleFor(x => x.P256dh).NotEmpty().WithMessage("p256dh zorunludur.");
        RuleFor(x => x.Auth).NotEmpty().WithMessage("auth zorunludur.");
    }
}

public class PushUnsubscribeRequestValidator : AbstractValidator<PushUnsubscribeRequest>
{
    public PushUnsubscribeRequestValidator()
    {
        RuleFor(x => x.Endpoint).NotEmpty().WithMessage("Endpoint zorunludur.");
    }
}
