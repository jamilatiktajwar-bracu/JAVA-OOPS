public class OfflineDownloadManager {
    private Movies[] downloads;
    private int[] progress;
    private boolean[] completed;
    private int downloadCount;
    private int downloadLimit;

    public OfflineDownloadManager(int downloadLimit) {
        this.downloadLimit = downloadLimit > 0 ? downloadLimit : 10;
        this.downloads = new Movies[this.downloadLimit];
        this.progress = new int[this.downloadLimit];
        this.completed = new boolean[this.downloadLimit];
        this.downloadCount = 0;
    }

    public boolean addDownload(Movies movie) {
        if (movie == null || !movie.isDownloadAvailable()
                || downloadCount >= downloadLimit
                || isDownloaded(movie)) {
            return false;
        }
        downloads[downloadCount] = movie;
        progress[downloadCount] = 0;
        completed[downloadCount] = false;
        downloadCount++;
        return true;
    }

    public boolean updateProgress(Movies movie, int percent) {
        if (movie == null || percent < 0 || percent > 100) {
            return false;
        }
        int index = findMovie(movie);
        if (index < 0) {
            return false;
        }
        progress[index] = percent;
        completed[index] = percent >= 100;
        if (completed[index]) {
            movie.download();
        }
        return true;
    }

    public boolean removeDownload(Movies movie) {
        int index = findMovie(movie);
        if (index < 0) {
            return false;
        }
        for (int i = index; i < downloadCount - 1; i++) {
            downloads[i] = downloads[i + 1];
            progress[i] = progress[i + 1];
            completed[i] = completed[i + 1];
        }
        downloads[--downloadCount] = null;
        progress[downloadCount] = 0;
        completed[downloadCount] = false;
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
                for (int j = i; j < downloadCount - 1; j++) {
                    downloads[j] = downloads[j + 1];
                    progress[j] = progress[j + 1];
                    completed[j] = completed[j + 1];
                }
                downloads[--downloadCount] = null;
                progress[downloadCount] = 0;
                completed[downloadCount] = false;
            } else {
                i++;
            }
        }
    }
}
