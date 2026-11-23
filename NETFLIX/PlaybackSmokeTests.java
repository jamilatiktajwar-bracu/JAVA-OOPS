final class PlaybackSmokeTests {
    static void run() {
        testPlaybackQueue();
        testPlaybackQueueRecoveryAfterEnd();
        testOfflineDownloads();
        testViewingSession();
    }

private static void testPlaybackQueue() {
        Movies first = new Movies("First", "Drama", 90);
        Movies second = new Movies("Second", "Drama", 100);
        PlaybackQueue queue = new PlaybackQueue(5);
        SmokeTestSupport.require(queue.add(first), "queue should accept first movie");
        SmokeTestSupport.require(queue.add(second), "queue should accept second movie");
        SmokeTestSupport.require(queue.remove(first), "queue should remove first movie");
        SmokeTestSupport.require(queue.getCurrent() == second, "current item should remain valid after removal");
        SmokeTestSupport.require(queue.getQueueCount() == 1, "queue count should be updated");
    }

private static void testPlaybackQueueRecoveryAfterEnd() {
        PlaybackQueue queue = new PlaybackQueue(3);
        Movies first = new Movies("Queue end first", "Drama", 60);
        Movies second = new Movies("Queue end second", "Drama", 60);
        SmokeTestSupport.require(queue.add(first), "queue should accept initial item");
        SmokeTestSupport.require(queue.next() == null, "single-item queue should reach end without repeat");
        SmokeTestSupport.require(queue.getCurrent() == null, "current should be null after reaching end");
        SmokeTestSupport.require(queue.getRemainingCount() == 0, "remaining count should be zero at end of queue");
        SmokeTestSupport.require(queue.add(second), "queue should accept item after end");
        SmokeTestSupport.require(queue.getCurrent() == second, "adding after end should restore a valid current item");
        SmokeTestSupport.require(queue.getCurrentIndex() == 1, "current index should track appended recovery item");
        SmokeTestSupport.require(queue.next() == null, "queue should end after the appended item");
        Movies third = new Movies("Queue end third", "Drama", 60);
        SmokeTestSupport.require(queue.addNext(third), "add-next should work after queue end");
        SmokeTestSupport.require(queue.getCurrent() == third, "add-next after end should select inserted item");
        SmokeTestSupport.require(queue.getCurrentIndex() == 0, "add-next should reset ended index safely");
    }

private static void testOfflineDownloads() {
        Movies movie = new Movies("Download test", "Drama", 100);
        movie.setDownloadAvailable(true);
        OfflineDownloadManager manager = new OfflineDownloadManager(3);
        SmokeTestSupport.require(manager.addDownload(movie), "download should be queued");
        SmokeTestSupport.require(!manager.addDownload(movie), "duplicate active download should be rejected");
        manager.setDownloadQuality("HD");
        SmokeTestSupport.require(manager.updateProgress(movie, 100), "download should complete");
        SmokeTestSupport.require(manager.getUsedStorageMB() == 200, "size should use quality snapshot from queue time");
        SmokeTestSupport.require(manager.removeDownload(movie), "download should be removable");
        SmokeTestSupport.require(manager.getUsedStorageMB() == 0, "storage accounting should return to zero");

        Movies failedMovie = new Movies("Failure test", "Drama", 80);
        failedMovie.setDownloadAvailable(true);
        SmokeTestSupport.require(manager.addDownload(failedMovie), "failed movie should be queueable");
        SmokeTestSupport.require(manager.markFailed(failedMovie, "network"), "failure should be recorded");
        SmokeTestSupport.require(manager.getFailedCount() == 1, "failed count should increase");
        SmokeTestSupport.require(manager.removeDownload(failedMovie), "failed download should be removable");
        SmokeTestSupport.require(manager.getFailedCount() == 0, "failed count should decrease after removal");
    }

private static void testViewingSession() {
        Movies movie = new Movies("Session test", "Drama", 120);
        ViewingSession session = new ViewingSession(movie, null);
        SmokeTestSupport.require(!session.setPlaybackSpeed(Double.NaN), "NaN playback speed should be rejected");
        SmokeTestSupport.require(!session.setPlaybackSpeed(Double.POSITIVE_INFINITY), "infinite playback speed should be rejected");
        SmokeTestSupport.require(session.setIntroRange(30, 60), "intro range should validate against full movie duration");
        SmokeTestSupport.require(!session.resumeAt(-1), "negative resume position should be rejected");
        SmokeTestSupport.require(session.getWatchedMinutes() == 0, "invalid resume must not change progress");
        SmokeTestSupport.require(session.pauseAt(20), "session should pause at valid progress");
        SmokeTestSupport.require(session.resumeAt(30), "session should resume at valid progress");
        SmokeTestSupport.require(session.getWatchedMinutes() == 30, "resume progress should be applied");
    }
}
