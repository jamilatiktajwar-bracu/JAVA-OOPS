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
    private double playbackSpeed;
    private String audioLanguage;
    private boolean captionsEnabled;
    private boolean dolbyAtmosEnabled;
    private boolean hdrEnabled;
    private boolean bufferPaused;
    private int bufferingPercent;
    private int bandwidthMbps;
    private int volumePercent;
    private boolean muted;
    private long startedAt;
    private long pausedAt;
    private long totalPausedMillis;
    private boolean playbackActive;
    private String[] availableQualities;
    private int qualityCount;
    private int[] bookmarks;
    private int bookmarkCount;
    private int introStartSeconds;
    private int introEndSeconds;
    private int creditsStartSeconds;
    private boolean skipIntroEnabled;
    private boolean skipCreditsEnabled;
    private boolean lowDataMode;
    private boolean audioDescriptionEnabled;
    private String[] eventLog;
    private int eventLogCount;
    private long lastHeartbeatAt;
    private int heartbeatCount;
    private String deviceName;
    private String networkType;

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
        this.playbackSpeed = 1.0;
        this.audioLanguage = "English";
        this.captionsEnabled = false;
        this.dolbyAtmosEnabled = false;
        this.hdrEnabled = false;
        this.bufferPaused = false;
        this.bufferingPercent = 100;
        this.bandwidthMbps = 0;
        this.volumePercent = 100;
        this.muted = false;
        this.startedAt = System.currentTimeMillis();
        this.pausedAt = 0;
        this.totalPausedMillis = 0;
        this.playbackActive = true;
        this.availableQualities = new String[]{"Auto", "480p", "720p", "1080p", "4K"};
        this.qualityCount = this.availableQualities.length;
        this.bookmarks = new int[100];
        this.bookmarkCount = 0;
        this.introStartSeconds = 0;
        this.introEndSeconds = 0;
        this.creditsStartSeconds = 0;
        this.skipIntroEnabled = false;
        this.skipCreditsEnabled = false;
        this.lowDataMode = false;
        this.audioDescriptionEnabled = false;
        this.eventLog = new String[200];
        this.eventLogCount = 0;
        this.lastHeartbeatAt = startedAt;
        this.heartbeatCount = 0;
        this.deviceName = "Unknown device";
        this.networkType = "Unknown";
        addEvent("SESSION_STARTED");
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
        if (playbackActive) {
            pausedAt = System.currentTimeMillis();
            playbackActive = false;
        }
        return true;
    }

    public boolean resumeAt(int watchedMinutes) {
        if (completed) {
            this.completed = false;
        }
        if (!pauseAt(watchedMinutes)) {
            return false;
        }
        if (pausedAt > 0) {
            totalPausedMillis += System.currentTimeMillis() - pausedAt;
            pausedAt = 0;
        }
        playbackActive = true;
        return true;
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

    public boolean setPlaybackSpeed(double speed) {
        if (speed < 0.25 || speed > 4.0) {
            return false;
        }
        playbackSpeed = speed;
        return true;
    }

    public double getPlaybackSpeed() {
        return playbackSpeed;
    }

    public void setAudioLanguage(String language) {
        if (language != null && !language.trim().isEmpty()) {
            audioLanguage = language.trim();
        }
    }

    public String getAudioLanguage() {
        return audioLanguage;
    }

    public void setCaptionsEnabled(boolean enabled) {
        captionsEnabled = enabled;
    }

    public boolean areCaptionsEnabled() {
        return captionsEnabled;
    }

    public void setDolbyAtmosEnabled(boolean enabled) {
        dolbyAtmosEnabled = enabled;
    }

    public boolean isDolbyAtmosEnabled() {
        return dolbyAtmosEnabled;
    }

    public void setHdrEnabled(boolean enabled) {
        hdrEnabled = enabled;
    }

    public boolean isHdrEnabled() {
        return hdrEnabled;
    }

    public boolean setBufferingPercent(int percent) {
        if (percent < 0 || percent > 100) {
            return false;
        }
        bufferingPercent = percent;
        bufferPaused = percent < 100;
        return true;
    }

    public int getBufferingPercent() {
        return bufferingPercent;
    }

    public boolean isBufferPaused() {
        return bufferPaused;
    }

    public boolean setBandwidthMbps(int bandwidthMbps) {
        if (bandwidthMbps < 0) {
            return false;
        }
        this.bandwidthMbps = bandwidthMbps;
        if (bandwidthMbps >= 25) {
            quality = "4K";
        } else if (bandwidthMbps >= 10) {
            quality = "1080p";
        } else if (bandwidthMbps >= 5) {
            quality = "720p";
        } else {
            quality = "480p";
        }
        return true;
    }

    public int getBandwidthMbps() {
        return bandwidthMbps;
    }

    public boolean setVolume(int volumePercent) {
        if (volumePercent < 0 || volumePercent > 100) {
            return false;
        }
        this.volumePercent = volumePercent;
        if (volumePercent > 0) {
            muted = false;
        }
        return true;
    }

    public int getVolumePercent() {
        return volumePercent;
    }

    public void setMuted(boolean muted) {
        this.muted = muted;
    }

    public boolean isMuted() {
        return muted;
    }

    public boolean isPlaybackActive() {
        return playbackActive;
    }

    public long getStartedAt() {
        return startedAt;
    }

    public long getTotalPausedMillis() {
        return totalPausedMillis;
    }

    public int getRemainingSeconds() {
        return getRemainingMinutes() * 60;
    }

    public int getEstimatedBufferSeconds() {
        if (bandwidthMbps == 0) {
            return 0;
        }
        return (100 - bufferingPercent) * bandwidthMbps;
    }

    public boolean isQualityAvailable(String qualityName) {
        if (qualityName == null) {
            return false;
        }
        for (int i = 0; i < qualityCount; i++) {
            if (availableQualities[i].equalsIgnoreCase(qualityName.trim())) {
                return true;
            }
        }
        return false;
    }

    public String[] getAvailableQualities() {
        String[] result = new String[qualityCount];
        System.arraycopy(availableQualities, 0, result, 0, qualityCount);
        return result;
    }

    public void startPlayback() {
        playbackActive = true;
        pausedAt = 0;
    }

    public void stopPlayback() {
        playbackActive = false;
        pausedAt = System.currentTimeMillis();
        addEvent("PLAYBACK_STOPPED");
    }

    public boolean setIntroRange(int startSeconds, int endSeconds) {
        if (startSeconds < 0 || endSeconds <= startSeconds
                || endSeconds > getRemainingSeconds()) {
            return false;
        }
        introStartSeconds = startSeconds;
        introEndSeconds = endSeconds;
        addEvent("INTRO_RANGE_SET");
        return true;
    }

    public boolean setCreditsStart(int startSeconds) {
        if (startSeconds < 0 || startSeconds > getRemainingSeconds()) {
            return false;
        }
        creditsStartSeconds = startSeconds;
        addEvent("CREDITS_RANGE_SET");
        return true;
    }

    public void setSkipIntroEnabled(boolean enabled) {
        skipIntroEnabled = enabled;
        addEvent(enabled ? "SKIP_INTRO_ENABLED" : "SKIP_INTRO_DISABLED");
    }

    public void setSkipCreditsEnabled(boolean enabled) {
        skipCreditsEnabled = enabled;
        addEvent(enabled ? "SKIP_CREDITS_ENABLED" : "SKIP_CREDITS_DISABLED");
    }

    public boolean isSkipIntroEnabled() {
        return skipIntroEnabled;
    }

    public boolean isSkipCreditsEnabled() {
        return skipCreditsEnabled;
    }

    public boolean shouldSkipIntro(int currentSeconds) {
        return skipIntroEnabled
                && introStartSeconds >= 0
                && currentSeconds >= introStartSeconds
                && currentSeconds < introEndSeconds;
    }

    public boolean shouldSkipCredits(int currentSeconds) {
        return skipCreditsEnabled
                && creditsStartSeconds > 0
                && currentSeconds >= creditsStartSeconds;
    }

    public boolean addBookmark(int currentSeconds) {
        if (currentSeconds < 0 || currentSeconds > getTotalSeconds()
                || bookmarkCount >= bookmarks.length) {
            return false;
        }
        for (int i = 0; i < bookmarkCount; i++) {
            if (bookmarks[i] == currentSeconds) {
                return false;
            }
        }
        bookmarks[bookmarkCount++] = currentSeconds;
        addEvent("BOOKMARK_ADDED");
        return true;
    }

    public int[] getBookmarks() {
        int[] result = new int[bookmarkCount];
        System.arraycopy(bookmarks, 0, result, 0, bookmarkCount);
        return result;
    }

    public int getBookmarkCount() {
        return bookmarkCount;
    }

    public boolean clearBookmarks() {
        for (int i = 0; i < bookmarkCount; i++) {
            bookmarks[i] = 0;
        }
        bookmarkCount = 0;
        addEvent("BOOKMARKS_CLEARED");
        return true;
    }

    public int getTotalSeconds() {
        return totalMinutes * 60;
    }

    public void setLowDataMode(boolean enabled) {
        lowDataMode = enabled;
        if (enabled && !quality.equals("480p")) {
            quality = "480p";
        }
        addEvent(enabled ? "LOW_DATA_ENABLED" : "LOW_DATA_DISABLED");
    }

    public boolean isLowDataMode() {
        return lowDataMode;
    }

    public void setAudioDescriptionEnabled(boolean enabled) {
        audioDescriptionEnabled = enabled;
        addEvent(enabled ? "AUDIO_DESCRIPTION_ENABLED" : "AUDIO_DESCRIPTION_DISABLED");
    }

    public boolean isAudioDescriptionEnabled() {
        return audioDescriptionEnabled;
    }

    public void setDeviceName(String deviceName) {
        if (deviceName != null && !deviceName.trim().isEmpty()) {
            this.deviceName = deviceName.trim();
        }
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setNetworkType(String networkType) {
        if (networkType != null && !networkType.trim().isEmpty()) {
            this.networkType = networkType.trim();
        }
    }

    public String getNetworkType() {
        return networkType;
    }

    public void sendHeartbeat() {
        heartbeatCount++;
        lastHeartbeatAt = System.currentTimeMillis();
        addEvent("HEARTBEAT");
    }

    public int getHeartbeatCount() {
        return heartbeatCount;
    }

    public long getLastHeartbeatAt() {
        return lastHeartbeatAt;
    }

    public long getSessionDurationMillis() {
        long endTime = playbackActive
                ? System.currentTimeMillis()
                : (pausedAt > 0 ? pausedAt : System.currentTimeMillis());
        return Math.max(0, endTime - startedAt - totalPausedMillis);
    }

    public void addEvent(String eventName) {
        if (eventName == null || eventName.trim().isEmpty()
                || eventLogCount >= eventLog.length) {
            return;
        }
        eventLog[eventLogCount++] = eventName.trim();
    }

    public String[] getEventLog() {
        String[] result = new String[eventLogCount];
        System.arraycopy(eventLog, 0, result, 0, eventLogCount);
        return result;
    }

    public int getEventLogCount() {
        return eventLogCount;
    }
}
