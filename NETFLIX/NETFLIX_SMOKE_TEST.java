public class NETFLIX_SMOKE_TEST {
    public static void main(String[] args) {
        testPlaybackQueue();
        testSystemHealthCounterSafety();
        testAdminAuditLogValidation();
        testCinemaAnalyticsConsistency();
        testOfflineDownloads();
        testViewingSession();
        testMovieReview();
        testLocaleIndependentMovieSearch();
        testSubscriptionPlanNormalization();
        testMovieConstructorNormalization();
        testMovieMetadataArrayHandling();
        testUnknownAgeRatingSafety();
        testSubscriptionPaymentAndRefundSafety();
        testPaymentWalletDefaultInvariant();
        testPromoCodeRedemptionConsistency();
        testNetflixUserInputValidation();
        testNetflixUserHistoryConsistency();
        testRecommendationEngineSafety();
        testRecommendationEngineNullUserPaths();
        testColdStartRecommendationLimit();
        testPlaylistCursorAndDurationSafety();
        testWatchPartyParticipationAndBoundaries();
        System.out.println("Netflix smoke tests passed.");
    }

    private static void testPlaybackQueue() {
        Movies first = new Movies("First", "Drama", 90);
        Movies second = new Movies("Second", "Drama", 100);
        Movies third = new Movies("Third", "Comedy", 110);
        PlaybackQueue queue = new PlaybackQueue(5);
        require(queue.add(first), "queue should accept first movie");
        require(queue.add(second), "queue should accept second movie");
        require(queue.remove(first), "queue should remove first movie");
        require(queue.getCurrent() == second, "current item should remain valid after removal");
        require(queue.getQueueCount() == 1, "queue count should be updated");

        PlaybackQueue endedQueue = new PlaybackQueue(3);
        require(endedQueue.add(first) && endedQueue.add(second) && endedQueue.add(third),
                "queue should accept items for end-of-queue test");
        require(endedQueue.next() == second && endedQueue.next() == third,
                "queue should advance through items");
        require(endedQueue.next() == null && endedQueue.getCurrent() == null,
                "queue should represent its ended state");
        require(endedQueue.next() == first && endedQueue.getCurrentIndex() == 0,
                "next after end should restart at the first item");
        require(endedQueue.addNext(first) == false,
                "queue should still reject duplicate entries");
        endedQueue.clear();
        require(endedQueue.addNext(third) && endedQueue.getCurrent() == third,
                "add-next should restore the cursor after clear");

        PlaybackQueue shuffleQueue = new PlaybackQueue(3);
        require(shuffleQueue.add(first) && shuffleQueue.add(second) && shuffleQueue.add(third),
                "shuffle queue should accept items");
        shuffleQueue.setShuffleEnabled(true);
        Movies initial = shuffleQueue.getCurrent();
        Movies next = shuffleQueue.next();
        Movies last = shuffleQueue.next();
        require(next != null && last != null && next != initial && last != initial && last != next,
                "shuffle should visit each item once before exhaustion");
        require(shuffleQueue.next() == null, "non-repeat shuffle should stop after a full cycle");
        shuffleQueue.setRepeatAll(true);
        require(shuffleQueue.next() != null, "repeat-all shuffle should begin a new cycle");
        require(!shuffleQueue.isRepeatOne(), "repeat-all should disable repeat-one mode");

        PlaybackQueue repeatOneQueue = new PlaybackQueue(2);
        require(repeatOneQueue.add(first), "repeat-one queue should accept item");
        repeatOneQueue.setRepeatOne(true);
        require(repeatOneQueue.next() == first && repeatOneQueue.getHistoryCount() == 0,
                "repeat-one should replay current item without adding duplicate history");
        repeatOneQueue.setRepeatAll(true);
        require(!repeatOneQueue.isRepeatOne(), "repeat-all should switch repeat modes");
    }

    private static void testAdminAuditLogValidation() {
        AdminAuditLog audit = new AdminAuditLog(3);
        require(audit.record(" admin ", " profile updated "),
                "audit log should accept valid trimmed values");
        require("admin".equals(audit.getActors()[0])
                && "profile updated".equals(audit.getActions()[0]),
                "audit log should normalize surrounding whitespace");
        String oversizedActor = new String(new char[129]).replace((char) 0, 'a');
        String oversizedAction = new String(new char[513]).replace((char) 0, 'x');
        require(!audit.record("actor" + (char) 10, "action")
                && !audit.record(oversizedActor, "action")
                && !audit.record("actor", oversizedAction),
                "audit log should reject control characters and oversized values");
        require(audit.getLogCount() == 1, "rejected audit entries must not mutate the log");
        audit.clear();
        require(audit.getLogCount() == 0 && "No actions".equals(audit.getLatestAction()),
                "audit clear should reset count and latest-action reporting");
    }

    private static void testCinemaAnalyticsConsistency() {
        NETFLIX_USER user = new NETFLIX_USER("analytics-tester");
        Movies watched = new Movies("Analytics watched", "Drama", 100);
        Movies favoriteOnly = new Movies("Analytics favorite only", "Comedy", 90);
        require(user.watchMovie(watched), "analytics test movie should enter history");
        require(user.addFavouriteMovie(favoriteOnly), "unwatched favorite should be accepted");
        require(CinemaAnalytics.getFavouriteRatio(user) == 0.0,
                "favorite ratio should count favorites within watch history");
        require(user.addFavouriteMovie(watched), "watched movie should be favorited");
        require(CinemaAnalytics.getFavouriteRatio(user) == 100.0,
                "favorite ratio should be bounded by history intersection");
        java.util.Locale original = java.util.Locale.getDefault();
        try {
            java.util.Locale.setDefault(new java.util.Locale("tr", "TR"));
            require(CinemaAnalytics.getEngagementSummary(user).contains("Completion: 100.0%"),
                    "analytics decimals should be stable across locales");
        } finally {
            java.util.Locale.setDefault(original);
        }
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
        session.setLowDataMode(true);
        require(session.getQuality().equals("480p"), "low-data mode should force SD quality");
        require(session.setBandwidthMbps(Integer.MAX_VALUE) && session.getQuality().equals("480p"),
                "bandwidth changes should not override low-data mode");
        session.setQuality("4K");
        require(session.getQuality().equals("480p"), "quality selection should respect low-data mode");
        session.setLowDataMode(false);
        session.setQuality("4K");
        require(session.getQuality().equals("4K"), "supported quality should be selectable when low-data mode is off");
        session.setQuality("8K");
        require(session.getQuality().equals("4K"), "unsupported quality should be ignored");
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
        review.markApproved();
        require(review.isApproved() && !review.isReported() && !review.needsReview(),
                "approval should clear the pending moderation flag while retaining report history");
        review.setSpoiler(true);
        require(review.needsReview(), "spoiler reviews should still require review");
        review.setSpoiler(false);
        require(!review.needsReview(), "removing a spoiler flag should clear review need");
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

    private static void testUnknownAgeRatingSafety() {
        String title = "Unrated safety test " + System.nanoTime();
        require(Movies.addMovie(title, "Drama", 90, 2025),
                "unrated test title should be added");
        try {
            Movies movie = Movies.searchByTitle(title)[0];
            require(movie.getAgeRating() == 0, "new movie should begin with unknown age rating");
            require(!movie.canBeWatchedBy(13) && movie.canBeWatchedBy(18)
                    && !movie.canBeWatchedBy(-1),
                    "unknown ratings should be blocked for minors and invalid ages");
            require(!containsTitle(Movies.filterByAgeRating(13), title),
                    "age-rating filter should omit unrated titles");
            require(!containsTitle(Movies.filterCatalog(null, 13, null, 0, 2200), title),
                    "catalog age filter should omit unrated titles for minors");

            movie.setRating(10.0);
            NETFLIX_USER child = new NETFLIX_USER("unrated-child");
            require(child.enableParentalControl("1234", 13),
                    "parental controls should enable for unrated-title test");
            RecommendationEngine engine = new RecommendationEngine(child);
            require(!containsTitle(engine.recommend(10), title)
                    && !containsTitle(engine.getColdStartRecommendations(10), title),
                    "recommendations should not expose unrated titles to restricted profiles");
        } finally {
            Movies.removeMovie(title);
        }
    }

    private static boolean containsTitle(Movies[] movies, String title) {
        if (movies == null || title == null) {
            return false;
        }
        for (Movies movie : movies) {
            if (movie != null && title.equals(movie.getTitle())) {
                return true;
            }
        }
        return false;
    }

    private static void testSubscriptionPaymentAndRefundSafety() {
        Subscription subscription = new Subscription("Pro");
        subscription.setPaymentMethod("Visa");
        require(subscription.processPayment(700.0), "valid subscription payment should succeed");
        require(subscription.getInvoiceCount() == 1, "successful payment should create invoice");
        require(subscription.refundInvoice(0), "paid invoice should be refundable");
        require(!subscription.refundInvoice(0), "invoice must not be refunded twice");
        require(subscription.getRefundedAmount() == 700.0, "refund total should track one refund");
        require("Refunded".equals(subscription.getBillingStatus()),
                "refund should update the overall billing status");
        require(subscription.getNetPaid() == 0.0,
                "net paid should subtract the refunded amount");

        Subscription trial = new Subscription("Pro");
        require(trial.startTrial(7), "bounded trial should start");
        for (int day = 0; day < 7; day++) {
            require(trial.consumeTrialDay(), "trial day should be consumed");
        }
        require(!trial.isInTrial() && !trial.startTrial(3),
                "an expired trial should not be restarted");
        require(!trial.startTrial(3651), "trial duration should be bounded");
        Subscription cancelledTrial = new Subscription("Pro");
        require(cancelledTrial.startTrial(14), "cancellation trial should start");
        cancelledTrial.cancel();
        require(!cancelledTrial.isInTrial() && cancelledTrial.getTrialDaysRemaining() == 0
                && "Cancelled".equals(cancelledTrial.getBillingStatus()),
                "cancel should clear trial state and set billing status");
        Subscription renewedSubscription = new Subscription("Pro");
        renewedSubscription.cancel();
        require(!renewedSubscription.isActive() && "Cancelled".equals(renewedSubscription.getBillingStatus()),
                "cancel should update status for non-trial subscriptions");
        renewedSubscription.renew();
        require(renewedSubscription.isActive() && renewedSubscription.isAutoRenew() && !renewedSubscription.isPaused()
                && "Current".equals(renewedSubscription.getBillingStatus()),
                "renew should restore a consistent subscription state");

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

        NETFLIX_USER paymentUser = new NETFLIX_USER("payment-default");
        PaymentMethod defaultCard = new PaymentMethod("Visa", "1111222233334444", "Owner");
        PaymentMethod alternate = new PaymentMethod("PayPal", "5555666677778888", "Owner");
        require(paymentUser.addPaymentMethod(defaultCard)
                && paymentUser.addPaymentMethod(alternate),
                "user wallet should accept both payment methods");
        require(paymentUser.getPaymentWallet().getDefaultMethod() == defaultCard
                && "Visa".equals(paymentUser.getSubscription().getPaymentMethod()),
                "subscription should keep the wallet's actual default method");
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
        require(!new PromoCode("  ", 10.0, 1).isValid(),
                "blank promo codes should not silently become a default code");
        require(!new PromoCode("ZERO-USE", 10.0, 0).isValid(),
                "promo codes with no allowed uses should be invalid");
    }

    private static void testNetflixUserInputValidation() {
        NETFLIX_USER user = new NETFLIX_USER("  test-user  ", "person@example.com", "unknown", "");
        require("test-user".equals(user.getUsername()), "constructor should trim username");
        require("Free".equals(user.getPlan()), "unknown plan should normalize to Free");
        require("Free".equals(user.getSubscription().getPlanName()),
                "subscription should use the same normalized plan as the user");
        require(user.getProfileName().equals(user.getUsername()), "profile name should initialize from normalized username");

        user.setUsername("  updated-user ");
        require("updated-user".equals(user.getUsername()), "username setter should trim input");
        user.setUsername("  ");
        require("updated-user".equals(user.getUsername()), "blank username should not overwrite current value");

        require(user.isValidEmail(), "valid email should pass validation");
        require(user.trySetEmail(" next@example.org "), "valid email should update");
        require("next@example.org".equals(user.getEmail()), "email should be trimmed on validated update");
        require(!user.trySetEmail("not-an-email"), "malformed email should be rejected");
        require(!user.trySetEmail("a@@example.com"), "multiple @ characters should be rejected");
        require(!user.trySetEmail("a b@example.com"), "whitespace in email should be rejected");
        require("next@example.org".equals(user.getEmail()), "rejected email must not overwrite current address");

        require(!user.setPassword("  "), "blank password updates should be rejected");
        require(user.setPassword("sample-password"), "nonblank password should be accepted");

        user.Plan = null; // Legacy public field: direct writes bypass normalizing setters.
        require(user.getDeviceLimit() == 1 && user.getFavouriteLimit() == 25
                && user.canUpgradePlan(), "legacy null plan should use safe limits");
        user.upgradePlan();
        require(user.Plan == null, "invalid legacy plan should not crash or mutate unexpectedly");
        user.setPlan("Pro");
        require("Pro".equals(user.getPlan()), "validated setter should restore a normalized plan");
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

    private static void testRecommendationEngineNullUserPaths() {
        String title = "Null user recommendation test " + System.nanoTime();
        require(Movies.addMovie(title, "NullUserGenre", 90),
                "temporary movie should be added for null-user recommendation test");
        try {
            Movies movie = Movies.searchByTitle(title)[0];
            NETFLIX_USER similarUser = new NETFLIX_USER("recommendation-source");
            require(similarUser.addFavouriteMovie(movie),
                    "collaborative source should accept its favorite movie");
            RecommendationEngine noUser = new RecommendationEngine(null);
            require(noUser.getGenreRecommendations("NullUserGenre", 2).length == 0,
                    "genre recommendations should safely return empty without user context");
            require(noUser.getCollaborativeRecommendations(similarUser, 2).length == 0,
                    "collaborative recommendations should safely return empty without user context");
        } finally {
            Movies.removeMovie(title);
        }
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
        NETFLIX_USER secondGuest = new NETFLIX_USER("party-guest-two");
        NETFLIX_USER outsider = new NETFLIX_USER("party-outsider");
        Movies movie = new Movies("Party boundary", "Drama", 90);
        WatchParty party = new WatchParty("Test Party", movie, host);

        require(!party.invite(host), "host should not be invited as a guest");
        require(party.invite(guest), "party should accept guest");
        require(party.invite(secondGuest), "party should accept another guest");
        require(!party.setMaxGuests(1), "guest capacity cannot be reduced below membership");
        require(party.setMaxGuests(2), "guest capacity may match current membership");
        require(!party.invite(guest), "duplicate guest should be rejected");
        require(!party.sendChat(outsider, "hello"), "outsider chat should be rejected");
        require(party.sendChat(guest, "hello"), "participant chat should be accepted");
        require(!party.sendChat(guest, "spam message"), "moderation should reject spam");
        String longChat = new String(new char[501]).replace((char) 0, 'x');
        require(!party.sendChat(guest, longChat), "chat length should be capped");
        require(party.sendReaction(guest, "👍"), "short reaction should be accepted");
        String longReaction = new String(new char[33]).replace((char) 0, 'x');
        require(!party.sendReaction(guest, longReaction), "reaction length should be capped");
        require(!party.muteGuest(host), "host should not be muteable as a guest");
        require(!party.muteGuest(outsider), "outsider should not be muteable");
        require(party.muteGuest(guest), "active guest should be muteable");
        require(!party.sendChat(guest, "muted"), "muted guest chat should be rejected");
        require(party.removeGuest(guest), "guest should be removable");
        require(!party.isMuted(guest), "removing guest should clear mute state");

        require(party.setPlaybackPosition(5400), "position at movie end should be valid in seconds");
        require(!party.setPlaybackPosition(5401), "position beyond movie duration should be rejected");
        party.setPlaybackPosition(20);
        party.play();
        require(!party.syncGuestPosition(-1), "negative sync position should be rejected");
        require(!party.syncGuestPosition(5401), "sync position beyond movie should be rejected");
        require(!party.syncGuestPosition(45) && party.getPlaybackPosition() == 20,
                "out-of-sync guest must not move the host timeline");
        require(party.syncGuestPosition(21), "guest within sync tolerance should be accepted");
        party.endParty();
        require(!party.invite(outsider), "ended party should not accept invitations");
        require(!party.sendChat(host, "after end"), "ended party should reject chat");
        require(!party.muteGuest(guest), "ended party should not allow muting");
        require(!party.setPlaybackPosition(10), "ended party should reject position changes");
        require(!party.synchronizeAllGuests(10), "ended party should reject synchronization");
        party.play();
        require(!party.isPlaying(), "ended party should not restart playback implicitly");
        party.restartParty();
        require(party.isPartyActive() && !party.isPlaying() && party.getStartedAt() == 0,
                "restart should reset party playback state and start timestamp");
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException("Smoke test failed: " + message);
        }
    }
}
