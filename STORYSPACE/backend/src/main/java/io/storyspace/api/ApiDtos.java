package io.storyspace.api;
import jakarta.validation.constraints.*;import java.time.Instant;import java.util.List;import java.util.UUID;
public final class ApiDtos {private ApiDtos(){}
 public record RegisterRequest(@Email @NotBlank @Size(max=190) String email,@NotBlank @Size(min=8,max=72) String password,@NotBlank @Size(max=80) String displayName){}
 public record LoginRequest(@Email @NotBlank String email,@NotBlank String password){}
 public record AuthResponse(String token,Profile profile){}
 public record Profile(UUID id,String email,String displayName,String role,List<String> genres,List<String> moods,List<String> languages){}
 public record PreferenceRequest(@NotBlank @Size(max=80) String displayName,@Size(max=20) List<String> genres,@Size(max=20) List<String> moods,@Size(max=10) List<String> languages){}
 public record TitleDto(UUID id,String slug,String name,String synopsis,List<String> genres,List<String> moods,String language,int releaseYear,String ageRating,String format,double score,String posterUrl,String backdropUrl,boolean featured,boolean original){}
 public record LibraryDto(TitleDto title,String state,int progressPercent,Integer userRating,double resumePositionSeconds,double durationSeconds,Instant lastPlayedAt,Instant updatedAt){}
 public record ProgressRequest(@Min(0) @Max(100) int progressPercent,@DecimalMin("0.0") @DecimalMax("86400.0") Double currentTime,@DecimalMin("0.0") @DecimalMax("86400.0") Double duration){}
 public record RatingRequest(@Min(1) @Max(5) int rating){}
}