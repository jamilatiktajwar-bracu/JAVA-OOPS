public class NETFLIX_SMOKE_TEST {
    public static void main(String[] args) {
        testPlaybackQueue();
        testOfflineDownloads();
        testViewingSession();
        testMovieReview();
        testLocaleIndependentMovieSearch();
        testSubscriptionPlanNormalization();
        testMovieConstructorNormalization();
        testMovieMetadataArrayHandling();
        testSubscriptionPaymentAndRefundSafety();
        System.out.println("Netflix smoke tests passed.");
    }

    private static void testPlaybackQueue() {
        Movies first = new Movies("First", "Drama", 90);
        Movies second = new Movies("Second", "Drama", 100);
        PlaybackQueue queue = new PlaybackQueue(5);
        require(queue.add(first), "queue should accept first movie");
        require(queue.add(second), "queue should accept second movie");
        require(queue.remove(first), "queue should remove first movie");
        require(queue.getCurrent() == second, "current item should remain valid after removal");
        require(queue.getQueueCount() == 1, "queue count should be updated");
    }

    private static void testOfflineDownloads() {
        Movies movie = new Movies("Download test", "Drama", 100);
        movie.setDownloadAvailable(true);
        OfflineDownloadManager manager = new OfflineDownloadManager(3);
        require(manager.addDownload(movie), "download should be queued");
        require(!manager.addDownload(movie), "duplicate active download should be rejected");
        manager.setDownloadQuality("HD");
        require(manager.updateProgress(movie, 100), "download should complete");
        require(manager.getUsedStorageMB() == 200, "size should use quality snapshot from queue time");
        require(manager.removeDownload(movie), "download should be removable");
        require(manager.getUsedStorageMB() == 0, "storage accounting should return to zero");

        Movies failedMovie = new Movies("Failure test", "Drama", 80);
        failedMovie.setDownloadAvailable(true);
        require(manager.addDownload(failedMovie), "failed movie should be queueable");
        require(manager.markFailed(failedMovie, "network"), "failure should be recorded");
        require(manager.getFailedCount() == 1, "failed count should increase");
        require(manager.removeDownload(failedMovie), "failed download should be removable");
        require(manager.getFailedCount() == 0, "failed count should decrease after removal");
    }

    private static void testViewingSession() {
        Movies movie = new Movies("Session test", "Drama", 120);
        ViewingSession session = new ViewingSession(movie, null);
        require(!session.setPlaybackSpeed(Double.NaN), "NaN playback speed should be rejected");
        require(!session.setPlaybackSpeed(Double.POSITIVE_INFINITY), "infinite playback speed should be rejected");
        require(session.setIntroRange(30, 60), "intro range should validate against full movie duration");
        require(!session.resumeAt(-1), "negative resume position should be rejected");
        require(session.getWatchedMinutes() == 0, "invalid resume must not change progress");
        require(session.pauseAt(20), "session should pause at valid progress");
        require(session.resumeAt(30), "session should resume at valid progress");
        require(session.getWatchedMinutes() == 30, "resume progress should be applied");
    }

    private static void testMovieReview() {
        MovieReview review = new MovieReview("Tester", 8.0, "Initial review");
        require(!review.wasEdited(), "new review should not be marked edited");
        require(review.edit("Updated review", 9.0), "valid review edit should succeed");
        require(review.wasEdited(), "edit flag should not depend on millisecond timestamp resolution");
        require(review.getUpdatedAt() > review.getCreatedAt(), "edit timestamp should advance monotonically");
        require(!review.edit(" ", 5.0), "blank review edit should fail");
        require(review.getRating() == 9.0, "invalid edit must preserve existing rating");
        review.addHelpfulVote();
        review.addNotHelpfulVote();
        require(review.getHelpfulnessScore() == 0, "vote score should reflect both vote types");
        require(review.report(), "report should be accepted");
        require(review.needsReview(), "reported review should require moderation");
    }

    private static void testLocaleIndependentMovieSearch() {
        require(Movies.addMovie("INDIGO", "Drama", 90), "test movie should be added");
        Movies testMovie = Movies.getMovie(Movies.getMovieCount() - 1);
        require(!testMovie.setRating(Double.NaN), "NaN movie rating should be rejected");
        require(!testMovie.setRating(Double.POSITIVE_INFINITY), "infinite movie rating should be rejected");
        require(testMovie.setRating(8.5), "finite rating within range should be accepted");
        java.util.Locale original = java.util.Locale.getDefault();
        try {
            java.util.Locale.setDefault(new java.util.Locale("tr", "TR"));
            require(Movies.searchByTitle("indigo").length == 1,
                    "title search should not depend on Turkish casing rules");
            require(Movies.search("indigo").length == 1,
                    "general search should not depend on Turkish casing rules");
        } finally {
            java.util.Locale.setDefault(original);
            Movies.removeMovie("INDIGO");
        }
    }

    private static void testSubscriptionPlanNormalization() {
        SubscriptionPlan invalid = new SubscriptionPlan("Invalid", Double.NaN, 0, 5000);
        require(invalid.getMonthlyFee() == 0.0, "invalid fee should normalize to zero");
        require(invalid.getScreens() == 1, "invalid screen count should normalize to one");
        require(invalid.getResolutionQuality() == 720, "invalid resolution should normalize to default");
        require(!invalid.isDownloadsEnabled(), "download capability should follow normalized fee");
        require(!invalid.isSpatialAudioEnabled(), "spatial audio should follow normalized resolution");
        require(SubscriptionPlan.maxPlan().isSpatialAudioEnabled(), "Max plan should enable spatial audio");
    }

    private static void testMovieConstructorNormalization() {
        Movies invalid = new Movies("  ", null, -10, 1800);
        require("Untitled".equals(invalid.getTitle()), "blank constructor title should normalize");
        require("Unknown".equals(invalid.getGenre()), "null constructor genre should normalize");
        require(invalid.getDuration() == 0, "invalid constructor duration should normalize to zero");
        require(invalid.getReleaseYear() == 0, "invalid constructor release year should remain unset");
        Movies valid = new Movies("  Film  ", "  Drama  ", 120, 2020);
        require("Film".equals(valid.getTitle()) && "Drama".equals(valid.getGenre()), "constructor should trim valid text");
        require(valid.getDuration() == 120 && valid.getReleaseYear() == 2020, "valid constructor values should be retained");
    }

    private static void testMovieMetadataArrayHandling() {
        Movies movie = new Movies("Array test", "Drama", 90);
        require(movie.addCastMember("Actor"), "first cast entry should be accepted");
        require(!movie.addCastMember(" actor "), "duplicate cast entry should be rejected case-insensitively");
        require(movie.addSubtitle("en"), "first subtitle should be accepted");
        require(!movie.addSubtitle(" EN "), "duplicate subtitle should be rejected case-insensitively");
        String[] cast = movie.getCast();
        cast[0] = "Mutated";
        require("Actor".equals(movie.getCast()[0]), "cast getter should return a defensive array copy");
    }

    private static void testSubscriptionPaymentAndRefundSafety() {
        Subscription subscription = new Subscription("Pro");
        subscription.setPaymentMethod("Visa");
        require(subscription.processPayment(700.0), "valid subscription payment should succeed");
        require(subscription.getInvoiceCount() == 1, "successful payment should create invoice");
        require(subscription.refundInvoice(0), "paid invoice should be refundable");
        require(!subscription.refundInvoice(0), "invoice must not be refunded twice");
        require(subscription.getRefundedAmount() == 700.0, "refund total should track one refund");

        Subscription fullInvoices = new Subscription("Pro");
        fullInvoices.setPaymentMethod("Visa");
        for (int i = 0; i < 100; i++) {
            require(fullInvoices.createInvoice(1.0, "Pending"), "invoice capacity should fill");
        }
        require(!fullInvoices.processPayment(700.0), "payment must fail when invoice history is full");
        require(fullInvoices.getBillingHistoryCount() == 0, "failed payment must not add billing history");

        Subscription cancelled = new Subscription("Pro");
        cancelled.cancel();
        cancelled.processFailedPayment();
        require(cancelled.getFailedPaymentCount() == 0, "cancelled subscription should ignore payment failure");
        require(cancelled.getOutstandingBalance() == 0.0, "cancelled subscription should not accrue balance");
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException("Smoke test failed: " + message);
        }
    }
}
