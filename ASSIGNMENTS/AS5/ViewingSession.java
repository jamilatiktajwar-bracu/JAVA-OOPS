public class ViewingSession {
    private Movies movie;
    private NETFLIX_USER user;
    private int startTimeMinutes;
    private int watchedMinutes;
    private int totalMinutes;
    private String quality;
    private boolean completed;
    private boolean subtitleEnabled;
    private String subtitleLanguage;

    public ViewingSession(Movies movie, NETFLIX_USER user) {
        this.movie = movie;
        this.user = user;
        this.startTimeMinutes = 0;
        this.watchedMinutes = 0;
        this.totalMinutes = movie == null ? 0 : movie.getDuration();
        this.quality = "Auto";
        this.completed = false;
        this.subtitleEnabled = false;
        this.subtitleLanguage = "English";
    }

    public boolean pauseAt(int watchedMinutes) {
        if (watchedMinutes < 0 || watchedMinutes > totalMinutes) {
            return false;
        }
        this.watchedMinutes = watchedMinutes;
        this.completed = watchedMinutes >= totalMinutes;
        if (completed && movie != null) {
            movie.markWatched();
        }
        return true;
    }

    public boolean resumeAt(int watchedMinutes) {
        if (completed) {
            this.completed = false;
        }
        return pauseAt(watchedMinutes);
    }

    public int getProgressPercent() {
        if (totalMinutes == 0) {
            return 0;
        }
        int progress = (watchedMinutes * 100) / totalMinutes;
        return Math.min(progress, 100);
    }

    public void setQuality(String quality) {
        if (quality != null && !quality.trim().isEmpty()) {
            this.quality = quality.trim();
        }
    }

    public void setSubtitleEnabled(boolean enabled) {
        subtitleEnabled = enabled;
    }

    public void setSubtitleLanguage(String language) {
        if (language != null && !language.trim().isEmpty()) {
            subtitleLanguage = language.trim();
        }
    }

    public Movies getMovie() {
        return movie;
    }

    public NETFLIX_USER getUser() {
        return user;
    }

    public int getWatchedMinutes() {
        return watchedMinutes;
    }

    public int getRemainingMinutes() {
        return totalMinutes - watchedMinutes;
    }

    public boolean isCompleted() {
        return completed;
    }

    public String getQuality() {
        return quality;
    }

    public boolean isSubtitleEnabled() {
        return subtitleEnabled;
    }

    public String getSubtitleLanguage() {
        return subtitleLanguage;
    }
}
