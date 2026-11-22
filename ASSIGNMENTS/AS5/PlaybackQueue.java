public class PlaybackQueue {
    private Movies[] queue;
    private int queueCount;
    private int currentIndex;
    private boolean repeatAll;
    private boolean shuffleEnabled;
    private boolean repeatOne;
    private double playbackSpeed;
    private int crossfadeSeconds;
    private Movies[] history;
    private int historyCount;
    private boolean autoplayEnabled;
    private String audioLanguage;
    private String subtitleLanguage;
    private boolean subtitlesEnabled;
    private long lastUpdatedAt;

    public PlaybackQueue(int capacity) {
        queue = new Movies[capacity > 0 ? capacity : 100];
        queueCount = 0;
        currentIndex = 0;
        repeatAll = false;
        shuffleEnabled = false;
        repeatOne = false;
        playbackSpeed = 1.0;
        crossfadeSeconds = 0;
        history = new Movies[capacity > 0 ? capacity : 100];
        historyCount = 0;
        autoplayEnabled = true;
        audioLanguage = "English";
        subtitleLanguage = "English";
        subtitlesEnabled = false;
        lastUpdatedAt = System.currentTimeMillis();
    }

    public boolean add(Movies movie) {
        if (movie == null || queueCount >= queue.length) {
            return false;
        }
        for (int i = 0; i < queueCount; i++) {
            if (queue[i] == movie) {
                return false;
            }
        }
        queue[queueCount++] = movie;
        touch();
        return true;
    }

    public boolean addNext(Movies movie) {
        if (movie == null || queueCount >= queue.length) {
            return false;
        }
        for (int i = queueCount; i > currentIndex + 1; i--) {
            queue[i] = queue[i - 1];
        }
        queue[currentIndex + 1] = movie;
        queueCount++;
        return true;
    }

    public boolean remove(Movies movie) {
        for (int i = 0; i < queueCount; i++) {
            if (queue[i] == movie) {
                for (int j = i; j < queueCount - 1; j++) {
                    queue[j] = queue[j + 1];
                }
                queue[--queueCount] = null;
                if (i < currentIndex) {
                    currentIndex--;
                }
                return true;
            }
        }
        return false;
    }

    public Movies getCurrent() {
        if (queueCount == 0 || currentIndex < 0 || currentIndex >= queueCount) {
            return null;
        }
        return queue[currentIndex];
    }

    public Movies next() {
        if (queueCount == 0) {
            return null;
        }
        Movies current = getCurrent();
        if (current != null) {
            addToHistory(current);
        }
        if (repeatOne) {
            touch();
            return current;
        }
        if (shuffleEnabled) {
            currentIndex = (int) (Math.random() * queueCount);
        } else {
            currentIndex++;
        }
        if (currentIndex >= queueCount) {
            if (repeatAll) {
                currentIndex = 0;
            } else {
                currentIndex = queueCount - 1;
                return null;
            }
        }
        touch();
        return queue[currentIndex];
    }

    public Movies previous() {
        if (queueCount == 0) {
            return null;
        }
        if (historyCount > 0) {
            Movies previousMovie = history[--historyCount];
            int index = indexOf(previousMovie);
            if (index >= 0) {
                currentIndex = index;
                touch();
                return previousMovie;
            }
        }
        currentIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        touch();
        return queue[currentIndex];
    }

    public void clear() {
        for (int i = 0; i < queueCount; i++) {
            queue[i] = null;
        }
        queueCount = 0;
        currentIndex = 0;
    }

    public Movies[] getQueue() {
        Movies[] result = new Movies[queueCount];
        System.arraycopy(queue, 0, result, 0, queueCount);
        return result;
    }

    public int getQueueCount() {
        return queueCount;
    }

    public int getCurrentIndex() {
        return currentIndex;
    }

    public void setRepeatAll(boolean repeatAll) {
        this.repeatAll = repeatAll;
    }

    public boolean isRepeatAll() {
        return repeatAll;
    }

    public void setShuffleEnabled(boolean shuffleEnabled) {
        this.shuffleEnabled = shuffleEnabled;
    }

    public boolean isShuffleEnabled() {
        return shuffleEnabled;
    }

    public boolean move(int fromIndex, int toIndex) {
        if (fromIndex < 0 || fromIndex >= queueCount
                || toIndex < 0 || toIndex >= queueCount
                || fromIndex == toIndex) {
            return false;
        }
        Movies movie = queue[fromIndex];
        if (fromIndex < toIndex) {
            for (int i = fromIndex; i < toIndex; i++) {
                queue[i] = queue[i + 1];
            }
        } else {
            for (int i = fromIndex; i > toIndex; i--) {
                queue[i] = queue[i - 1];
            }
        }
        queue[toIndex] = movie;
        if (currentIndex == fromIndex) {
            currentIndex = toIndex;
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
            currentIndex--;
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
            currentIndex++;
        }
        touch();
        return true;
    }

    public boolean moveToNext(Movies movie) {
        int index = indexOf(movie);
        if (index < 0) {
            return false;
        }
        int target = Math.min(currentIndex + 1, queueCount - 1);
        return move(index, target);
    }

    public int indexOf(Movies movie) {
        if (movie == null) {
            return -1;
        }
        for (int i = 0; i < queueCount; i++) {
            if (queue[i] == movie) {
                return i;
            }
        }
        return -1;
    }

    public boolean contains(Movies movie) {
        return indexOf(movie) >= 0;
    }

    public void setRepeatOne(boolean repeatOne) {
        this.repeatOne = repeatOne;
        if (repeatOne) {
            repeatAll = false;
        }
    }

    public boolean isRepeatOne() {
        return repeatOne;
    }

    public boolean setPlaybackSpeed(double speed) {
        if (speed < 0.25 || speed > 4.0) {
            return false;
        }
        playbackSpeed = speed;
        touch();
        return true;
    }

    public double getPlaybackSpeed() {
        return playbackSpeed;
    }

    public boolean setCrossfadeSeconds(int seconds) {
        if (seconds < 0 || seconds > 30) {
            return false;
        }
        crossfadeSeconds = seconds;
        touch();
        return true;
    }

    public int getCrossfadeSeconds() {
        return crossfadeSeconds;
    }

    private void addToHistory(Movies movie) {
        if (movie == null) {
            return;
        }
        if (historyCount < history.length) {
            history[historyCount++] = movie;
        } else {
            for (int i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history[history.length - 1] = movie;
        }
    }

    public Movies[] getHistory() {
        Movies[] result = new Movies[historyCount];
        System.arraycopy(history, 0, result, 0, historyCount);
        return result;
    }

    public int getHistoryCount() {
        return historyCount;
    }

    public void clearHistory() {
        for (int i = 0; i < historyCount; i++) {
            history[i] = null;
        }
        historyCount = 0;
        touch();
    }

    public void setAutoplayEnabled(boolean enabled) {
        autoplayEnabled = enabled;
        touch();
    }

    public boolean isAutoplayEnabled() {
        return autoplayEnabled;
    }

    public void setAudioLanguage(String language) {
        if (language != null && !language.trim().isEmpty()) {
            audioLanguage = language.trim();
            touch();
        }
    }

    public String getAudioLanguage() {
        return audioLanguage;
    }

    public void setSubtitleLanguage(String language) {
        if (language != null && !language.trim().isEmpty()) {
            subtitleLanguage = language.trim();
            touch();
        }
    }

    public String getSubtitleLanguage() {
        return subtitleLanguage;
    }

    public void setSubtitlesEnabled(boolean enabled) {
        subtitlesEnabled = enabled;
        touch();
    }

    public boolean areSubtitlesEnabled() {
        return subtitlesEnabled;
    }

    public int getRemainingCount() {
        if (queueCount == 0) {
            return 0;
        }
        return Math.max(0, queueCount - currentIndex - 1);
    }

    public int getTotalDuration() {
        int total = 0;
        for (int i = 0; i < queueCount; i++) {
            total += queue[i].getDuration();
        }
        return total;
    }

    public long getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    private void touch() {
        lastUpdatedAt = System.currentTimeMillis();
    }
}
