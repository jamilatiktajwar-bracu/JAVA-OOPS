public class NETFLIX_SMOKE_TEST {
    public static void main(String[] args) {
        testPlaybackQueue();
        testSystemHealthCounterSafety();
        testOfflineDownloads();
        testViewingSession();
        testMovieReview();
        testLocaleIndependentMovieSearch();
        testSubscriptionPlanNormalization();
        testMovieConstructorNormalization();
        testMovieMetadataArrayHandling();
        testSubscriptionPaymentAndRefundSafety();
        testPaymentWalletDefaultInvariant();
        testPromoCodeRedemptionConsistency();
        testNetflixUserHistoryConsistency();
        testRecommendationEngineSafety();
        testColdStartRecommendationLimit();
        testPlaylistCursorAndDurationSafety();
        testWatchPartyParticipationAndBoundaries();
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
        require(manager.updateProgress(movie, 40), "partial progress should be accepted");
        require(!manager.updateProgress(movie, 20), "download progress should not move backward");
        require(manager.getProgress(movie) == 40, "rejected progress update should preserve state");
        manager.setDownloadQuality("HD");
        require(manager.updateProgress(movie, 100), "download should complete");
        require(manager.getUsedStorageMB() == 200, "size should use quality snapshot from queue time");
        require(!manager.updateProgress(movie, 50), "completed download must not be downgraded");
        require(manager.isDownloaded(movie), "completed state should remain true after rejected downgrade");
        require(manager.getUsedStorageMB() == 200, "rejected downgrade must not leak storage accounting");
        require(!manager.markFailed(movie, "late failure"), "completed download cannot be marked failed");
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
        require(session.setBufferingPercent(0), "buffering percent should accept valid zero");
        require(session.setBandwidthMbps(Integer.MAX_VALUE), "bandwidth should accept nonnegative values");
        require(session.getEstimatedBufferSeconds() == Integer.MAX_VALUE,
                "buffer estimate should saturate rather than overflow");
    }

    private static void testSystemHealthCounterSafety() {
        SystemHealthMonitor monitor = new SystemHealthMonitor();
        monitor.addUptimeSeconds(Integer.MAX_VALUE);
        monitor.addUptimeSeconds(1);
        require(monitor.getUptimeSeconds() == Integer.MAX_VALUE,
                "uptime should saturate rather than overflow");
        monitor.setActiveSessions(Integer.MAX_VALUE);
        require(monitor.getActiveSessions() == Integer.MAX_VALUE,
                "maximum active-session count should be retained");
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
        int initialCount = Movies.getMovieCount();
        require(!Movies.addMovie("Invalid release year", "Drama", 90, 1800),
                "catalog overload should reject invalid release years");
        require(Movies.getMovieCount() == initialCount,
                "invalid release year must not partially add a catalog movie");
        require(Movies.searchByTitle(" ").length == 0,
                "blank title search should return no results");
        require(Movies.addMovie("INDIGO", "Drama", 90), "test movie should be added");
        Movies testMovie = Movies.getMovie(Movies.getMovieCount() - 1);
        require(!testMovie.setRating(Double.NaN), "NaN movie rating should be rejected");
        require(!testMovie.setRating(Double.POSITIVE_INFINITY), "infinite movie rating should be rejected");
        require(testMovie.setRating(8.5), "finite rating within range should be accepted");
        require(!testMovie.addUserRating(Double.NaN), "NaN community rating should be rejected");
        require(!testMovie.addUserRating(Double.POSITIVE_INFINITY), "infinite community rating should be rejected");
        require(testMovie.getRating() == 8.5, "invalid community ratings should not poison the aggregate");
        require(testMovie.addKeyword("INDIGO"), "keyword should be accepted");
        Movies watchCounter = new Movies("Watch counter", "Drama", 90);
        watchCounter.recordWatchSeconds(Integer.MAX_VALUE);
        watchCounter.recordWatchSeconds(100);
        require(watchCounter.getTotalWatchSeconds() == Integer.MAX_VALUE,
                "watch seconds should saturate instead of overflowing");
        java.util.Locale original = java.util.Locale.getDefault();
        try {
            java.util.Locale.setDefault(new java.util.Locale("tr", "TR"));
            require(Movies.searchByTitle("indigo").length == 1,
                    "title search should not depend on Turkish casing rules");
            require(Movies.search("indigo").length == 1,
                    "general search should not depend on Turkish casing rules");
            require(testMovie.hasKeyword("indigo"),
                    "keyword matching should not depend on Turkish casing rules");
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

    private static void testPaymentWalletDefaultInvariant() {
        PaymentWallet wallet = new PaymentWallet(3);
        PaymentMethod first = new PaymentMethod("Card", "123456", "First");
        PaymentMethod second = new PaymentMethod("Card", "654321", "Second");
        second.setDefault(true);
        require(wallet.addMethod(first), "first method should be added");
        require(wallet.getDefaultMethod() == first, "first wallet method should become default");
        require(wallet.addMethod(second), "second method should be added");
        require(wallet.getDefaultMethod() == first, "externally pre-marked default must not override wallet default");
        require(wallet.setDefault(second), "wallet should allow switching default");
        require(wallet.removeMethod(second), "default method should be removable");
        require(wallet.getDefaultMethod() == first, "wallet should select remaining method as default");
        require(!second.isDefaultMethod(), "removed method should no longer carry a default flag");
        require(wallet.getMethodCount() == 1, "wallet count should remain consistent");
    }

    private static void testPromoCodeRedemptionConsistency() {
        Subscription subscription = new Subscription("Pro");
        PromoCode first = new PromoCode("SAVE10", 10.0, 5);
        PromoCode second = new PromoCode("SAVE20", 20.0, 5);
        require(first.redeem(subscription), "first promo should redeem");
        require(!second.redeem(subscription), "second promo should not replace active coupon");
        require(first.getRemainingUses() == 4, "successful redemption should consume one use");
        require(second.getRemainingUses() == 5, "failed redemption should not consume promo usage");
        subscription.removeCoupon();
        require(second.redeem(subscription), "second promo should redeem after active coupon is removed");
    }

    private static void testNetflixUserHistoryConsistency() {
        NETFLIX_USER user = new NETFLIX_USER("history-tester");
        Movies movie = new Movies("History completion", "Drama", 100);
        require(user.updateViewingProgress(movie, 40), "partial progress should be tracked");
        require(user.updateViewingProgress(movie, 95), "completion progress should be accepted");
        require(user.getContinueWatchingCount() == 0, "completed movie should leave continue-watching");
        require(user.isInWatchHistory(movie), "completed movie should enter watch history");
        require(user.watchMovie(movie), "watching an already-recorded movie should succeed");
        require(user.getWatchHistoryCount() == 1, "re-watch must not duplicate history");
        require(!user.addFamilyProfile(user), "profile must not add itself as a family profile");
        require(user.getTotalWatchedMinutes() == 100, "watch time should count unique history entries");
        NETFLIX_USER fullHistory = new NETFLIX_USER("full-history");
        for (int i = 0; i < 100; i++) {
            require(fullHistory.watchMovie(new Movies("History " + i, "Drama", 1)),
                    "history should accept entries up to its capacity");
        }
        Movies overflowMovie = new Movies("Overflow completion", "Drama", 1);
        require(fullHistory.updateViewingProgress(overflowMovie, 50),
                "partial progress can be stored while history is full");
        require(!fullHistory.updateViewingProgress(overflowMovie, 95),
                "completion should fail atomically when history is full");
        require(fullHistory.getViewingProgress(overflowMovie) == 50,
                "failed completion must preserve previous progress");
        require(!overflowMovie.isWatched(), "failed completion should not mark movie watched");

    }

    private static void testRecommendationEngineSafety() {
        NETFLIX_USER user = new NETFLIX_USER("recommend-tester", "Pro");
        RecommendationEngine engine = new RecommendationEngine(user);
        require(!engine.setRatingThreshold(Double.NaN), "NaN recommendation threshold should be rejected");
        require(!engine.setPopularityWeight(Double.POSITIVE_INFINITY), "infinite recommendation weight should be rejected");
        require(engine.excludeGenre("Drama"), "genre exclusion should succeed");
        require(!engine.excludeGenre(" drama "), "duplicate excluded genre should be rejected");
        require(engine.removeExcludedGenre("DRAMA"), "genre exclusion should be case-insensitive");
        Movies[] coldStart = engine.recommend(3);
        require(coldStart.length <= 3, "cold-start recommendations should respect limit");
        engine.clearRecommendationHistory();
        Movies[] surprise = engine.getSurpriseRecommendations(5);
        for (int i = 0; i < surprise.length; i++) {
            for (int j = i + 1; j < surprise.length; j++) {
                require(surprise[i] != surprise[j], "surprise recommendations should not contain duplicates");
            }
        }
        RecommendationEngine noUser = new RecommendationEngine(null);
        require(noUser.recommend(3).length == 0, "null-user recommendation should return empty");
        require(noUser.getSurpriseRecommendations(3).length == 0, "null-user surprise should return empty");
        require("No movie or user context".equals(noUser.explainRecommendation(new Movies("Explain", "Drama", 90))),
                "explanation should handle missing user safely");
    }

    private static void testColdStartRecommendationLimit() {
        String suffix = Long.toString(System.nanoTime());
        String[] titles = new String[] {
            "Cold Start Limit A " + suffix,
            "Cold Start Limit B " + suffix,
            "Cold Start Limit C " + suffix,
            "Cold Start Limit D " + suffix
        };
        try {
            for (int i = 0; i < titles.length; i++) {
                require(Movies.addMovie(titles[i], "Test Genre", 90),
                        "temporary cold-start catalog movie should be added");
                Movies movie = Movies.searchByTitle(titles[i])[0];
                require(movie.setRating(10.0 - i),
                        "temporary movie should accept a valid rating");
            }

            NETFLIX_USER user = new NETFLIX_USER("cold-start-limit-" + suffix);
            RecommendationEngine engine = new RecommendationEngine(user);
            require(engine.getColdStartRecommendations(2).length == 2,
                    "cold-start helper should honor its requested limit");
            require(engine.recommend(2).length == 2,
                    "cold-start recommend should honor its requested limit");
            require(engine.recommend(1).length <= 1,
                    "repeat cold-start recommendation should still honor its limit");
        } finally {
            for (String title : titles) {
                Movies.removeMovie(title);
            }
        }
    }

    private static void testPlaylistCursorAndDurationSafety() {
        NetflixPlaylist playlist = new NetflixPlaylist("Cursor", 4);
        Movies first = new Movies("Playlist first", "Drama", 100);
        Movies second = new Movies("Playlist second", "Drama", 200);
        Movies third = new Movies("Playlist third", "Drama", 300);
        require(playlist.addMovies(new Movies[] {first, second, third}) == 3,
                "bulk add should accept unique movies");
        require(playlist.getNextMovie() == first, "cursor should begin at first item");
        require(playlist.removeMovie(first), "removing an item before cursor should succeed");
        require(playlist.getNextMovie() == second, "cursor should stay aligned after removing passed item");
        require(playlist.moveMovie(1, 0), "moving item should succeed");
        require(playlist.getMovieAt(0) == third, "move should reorder playlist");
        require(playlist.getNextMovie() == third, "cursor should follow moved next item");
        require(playlist.getTotalDuration() == 500, "playlist duration should sum movie lengths");
        require(playlist.getRemainingCapacity() == 2, "capacity should track additions");
        require(!playlist.addMovie(null), "null movie should not be accepted");
    }


    private static void testWatchPartyParticipationAndBoundaries() {
        NETFLIX_USER host = new NETFLIX_USER("party-host");
        NETFLIX_USER guest = new NETFLIX_USER("party-guest");
        NETFLIX_USER outsider = new NETFLIX_USER("party-outsider");
        Movies movie = new Movies("Party boundary", "Drama", 90);
        WatchParty party = new WatchParty("Test Party", movie, host);

        require(!party.invite(host), "host should not be invited as a guest");
        require(party.invite(guest), "party should accept guest");
        require(!party.invite(guest), "duplicate guest should be rejected");
        require(!party.sendChat(outsider, "hello"), "outsider chat should be rejected");
        require(party.sendChat(guest, "hello"), "participant chat should be accepted");
        require(!party.sendChat(guest, "spam message"), "moderation should reject spam");
        require(!party.muteGuest(host), "host should not be muteable as a guest");
        require(!party.muteGuest(outsider), "outsider should not be muteable");
        require(party.muteGuest(guest), "active guest should be muteable");
        require(!party.sendChat(guest, "muted"), "muted guest chat should be rejected");
        require(party.removeGuest(guest), "guest should be removable");
        require(!party.isMuted(guest), "removing guest should clear mute state");

        require(party.setPlaybackPosition(5400), "position at movie end should be valid in seconds");
        require(!party.setPlaybackPosition(5401), "position beyond movie duration should be rejected");
        party.play();
        require(!party.syncGuestPosition(-1), "negative sync position should be rejected");
        require(!party.syncGuestPosition(5401), "sync position beyond movie should be rejected");
        party.endParty();
        require(!party.invite(outsider), "ended party should not accept invitations");
        require(!party.sendChat(host, "after end"), "ended party should reject chat");
        require(!party.muteGuest(guest), "ended party should not allow muting");
        party.restartParty();
        require(party.isPartyActive(), "restart should reactivate party");
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException("Smoke test failed: " + message);
        }
    }
}
