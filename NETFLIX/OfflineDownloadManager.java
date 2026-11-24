public class OfflineDownloadManager {
    private Movies[] downloads;
    private int[] progress;
    private boolean[] completed;
    private int downloadCount;
    private int downloadLimit;
    private long storageCapacityMB;
    private long usedStorageMB;
    private boolean wifiOnly;
    private boolean paused;
    private String downloadQuality;
    private int[] priority;
    private boolean[] failed;
    private String[] failureReason;
    private int failedCount;
    private long[] downloadStartedAt;
    private long[] downloadCompletedAt;
    private long[] downloadedSizeMB;

    public OfflineDownloadManager(int downloadLimit) {
        this.downloadLimit = downloadLimit > 0 ? downloadLimit : 10;
        this.downloads = new Movies[this.downloadLimit];
        this.progress = new int[this.downloadLimit];
        this.completed = new boolean[this.downloadLimit];
        this.downloadCount = 0;
        this.storageCapacityMB = 5000;
        this.usedStorageMB = 0;
        this.wifiOnly = true;
        this.paused = false;
        this.downloadQuality = "Standard";
        this.priority = new int[this.downloadLimit];
        this.failed = new boolean[this.downloadLimit];
        this.failureReason = new String[this.downloadLimit];
        this.failedCount = 0;
        this.downloadStartedAt = new long[this.downloadLimit];
        this.downloadCompletedAt = new long[this.downloadLimit];
        this.downloadedSizeMB = new long[this.downloadLimit];
    }

    public boolean addDownload(Movies movie) {
        if (movie == null || !movie.isDownloadAvailable()
                || downloadCount >= downloadLimit
                || findMovie(movie) >= 0 || paused
                || !hasEnoughStorage(movie)) {
            return false;
        }
        downloads[downloadCount] = movie;
        progress[downloadCount] = 0;
        completed[downloadCount] = false;
        priority[downloadCount] = 50;
        failed[downloadCount] = false;
        failureReason[downloadCount] = "";
        downloadStartedAt[downloadCount] = System.currentTimeMillis();
        downloadCompletedAt[downloadCount] = 0;
        downloadCount++;
        return true;
    }

    public boolean updateProgress(Movies movie, int percent) {
        if (movie == null || percent < 0 || percent > 100 || paused) {
            return false;
        }
        int index = findMovie(movie);
        if (index < 0) {
            return false;
        }
        if (failed[index] || (completed[index] && percent < 100)
                || percent < progress[index]) {
            return false;
        }
        boolean wasCompleted = completed[index];
        progress[index] = percent;
        completed[index] = percent >= 100;
        if (completed[index] && !wasCompleted) {
            long size = estimateMovieSizeMB(movie);
            if (size > storageCapacityMB - usedStorageMB) {
                progress[index] = 99;
                completed[index] = false;
                return false;
            }
            movie.download();
            downloadCompletedAt[index] = System.currentTimeMillis();
            usedStorageMB += size;
            downloadedSizeMB[index] = size;
        }
        return true;
    }

    public boolean removeDownload(Movies movie) {
        int index = findMovie(movie);
        if (index < 0) {
            return false;
        }
        boolean wasFailed = failed[index];
        if (completed[index]) {
            usedStorageMB = Math.max(0,
                    usedStorageMB - downloadedSizeMB[index]);
        }
        for (int i = index; i < downloadCount - 1; i++) {
            downloads[i] = downloads[i + 1];
            progress[i] = progress[i + 1];
            completed[i] = completed[i + 1];
            priority[i] = priority[i + 1];
            failed[i] = failed[i + 1];
            failureReason[i] = failureReason[i + 1];
            downloadStartedAt[i] = downloadStartedAt[i + 1];
            downloadCompletedAt[i] = downloadCompletedAt[i + 1];
            downloadedSizeMB[i] = downloadedSizeMB[i + 1];
        }
        downloads[--downloadCount] = null;
        progress[downloadCount] = 0;
        completed[downloadCount] = false;
        downloadedSizeMB[downloadCount] = 0;
        if (wasFailed) {
            failedCount = Math.max(0, failedCount - 1);
        }
        failed[downloadCount] = false;
        failureReason[downloadCount] = null;
        return true;
    }

    public boolean isDownloaded(Movies movie) {
        int index = findMovie(movie);
        return index >= 0 && completed[index];
    }

    public int getProgress(Movies movie) {
        int index = findMovie(movie);
        return index < 0 ? -1 : progress[index];
    }

    private int findMovie(Movies movie) {
        for (int i = 0; i < downloadCount; i++) {
            if (downloads[i] == movie) {
                return i;
            }
        }
        return -1;
    }

    public Movies[] getDownloads() {
        Movies[] result = new Movies[downloadCount];
        System.arraycopy(downloads, 0, result, 0, downloadCount);
        return result;
    }

    public int getDownloadCount() {
        return downloadCount;
    }

    public int getRemainingSlots() {
        return downloadLimit - downloadCount;
    }

    public void clearCompleted() {
        for (int i = 0; i < downloadCount;) {
            if (completed[i]) {
                removeDownload(downloads[i]);
            } else {
                i++;
            }
        }
    }

    public void setStorageCapacityMB(long capacityMB) {
        if (capacityMB >= usedStorageMB) {
            storageCapacityMB = capacityMB;
        }
    }

    public long getStorageCapacityMB() {
        return storageCapacityMB;
    }

    public long getUsedStorageMB() {
        return usedStorageMB;
    }

    public long getRemainingStorageMB() {
        return Math.max(0, storageCapacityMB - usedStorageMB);
    }

    public boolean hasEnoughStorage(Movies movie) {
        if (movie == null) {
            return false;
        }
        return getRemainingStorageMB() >= estimateMovieSizeMB(movie);
    }

    private long estimateMovieSizeMB(Movies movie) {
        if (downloadQuality.equalsIgnoreCase("HD")) {
            return movie.getDuration() * 4L;
        }
        if (downloadQuality.equalsIgnoreCase("4K")) {
            return movie.getDuration() * 12L;
        }
        return movie.getDuration() * 2L;
    }

    public void setDownloadQuality(String quality) {
        if (quality != null
                && (quality.equalsIgnoreCase("Standard")
                || quality.equalsIgnoreCase("HD")
                || quality.equalsIgnoreCase("4K"))) {
            downloadQuality = quality;
        }
    }

    public String getDownloadQuality() {
        return downloadQuality;
    }

    public void setWifiOnly(boolean wifiOnly) {
        this.wifiOnly = wifiOnly;
    }

    public boolean isWifiOnly() {
        return wifiOnly;
    }

    public void pauseDownloads() {
        paused = true;
    }

    public void resumeDownloads() {
        paused = false;
    }

    public boolean areDownloadsPaused() {
        return paused;
    }

    public boolean setPriority(Movies movie, int priorityValue) {
        int index = findMovie(movie);
        if (index < 0 || priorityValue < 0 || priorityValue > 100) {
            return false;
        }
        priority[index] = priorityValue;
        return true;
    }

    public int getPriority(Movies movie) {
        int index = findMovie(movie);
        return index < 0 ? -1 : priority[index];
    }

    public boolean markFailed(Movies movie, String reason) {
        int index = findMovie(movie);
        if (index < 0 || completed[index]) {
            return false;
        }
        if (!failed[index]) {
            failed[index] = true;
            failedCount++;
        }
        failureReason[index] = reason == null || reason.trim().isEmpty()
                ? "Unknown error" : reason.trim();
        return true;
    }

    public boolean retryFailedDownload(Movies movie) {
        int index = findMovie(movie);
        if (index < 0 || !failed[index]) {
            return false;
        }
        failed[index] = false;
        failureReason[index] = "";
        failedCount = Math.max(0, failedCount - 1);
        progress[index] = 0;
        completed[index] = false;
        downloadStartedAt[index] = System.currentTimeMillis();
        downloadCompletedAt[index] = 0;
        return true;
    }

    public String getFailureReason(Movies movie) {
        int index = findMovie(movie);
        return index < 0 ? "" : failureReason[index];
    }

    public int getFailedCount() {
        return failedCount;
    }

    public long getDownloadStartedAt(Movies movie) {
        int index = findMovie(movie);
        return index < 0 ? 0 : downloadStartedAt[index];
    }

    public long getDownloadCompletedAt(Movies movie) {
        int index = findMovie(movie);
        return index < 0 ? 0 : downloadCompletedAt[index];
    }

    public boolean isActiveDownload(Movies movie) {
        int index = findMovie(movie);
        return index >= 0 && !completed[index] && !paused && !failed[index];
    }
}
