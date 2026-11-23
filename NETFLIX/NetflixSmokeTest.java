public class NetflixSmokeTest {
    public static void main(String[] args) {
        Movies.clearMovies();
        Movies.addMovie("Alpha", "Drama", 100, 2020);
        Movies.addMovie("Beta", "Comedy", 110, 2021);
        Movies.addMovie("Gamma", "Action", 120, 2022);
        Movies.addMovie("Delta", "Sci-Fi", 130, 2023);

        NETFLIX_USER user = new NETFLIX_USER("smoke-user");
        RecommendationEngine engine = new RecommendationEngine(user);
        check(engine.isColdStartUser(), "new profile is recognized as cold start");
        Movies[] expectedColdStart = engine.getColdStartRecommendations(3);
        Movies[] primaryColdStart = engine.recommend(3);
        check(java.util.Arrays.equals(expectedColdStart, primaryColdStart),
                "primary recommendation path uses cold-start ranking");
        check(primaryColdStart.length <= 3, "recommend respects limit");
        check(engine.getSurpriseRecommendations(10).length <= 4,
                "surprise recommendation respects catalog size");

        engine.clearRecommendationHistory();
        Movies[] surprise = engine.getSurpriseRecommendations(4);
        for (int i = 0; i < surprise.length; i++) {
            for (int j = i + 1; j < surprise.length; j++) {
                check(surprise[i] != surprise[j], "surprise picks are unique");
            }
        }

        RecommendationEngine noUser = new RecommendationEngine(null);
        check(noUser.recommend(5).length == 0, "null-user recommendations safe");
        check(noUser.getGenreRecommendations("Drama", 5).length == 0,
                "null-user genre recommendations safe");
        check(noUser.getSurpriseRecommendations(5).length == 0,
                "null-user surprise recommendations safe");
        check("No movie or user context".equals(noUser.explainRecommendation(null)),
                "null recommendation explanation safe");
        check(!engine.setRatingThreshold(Double.NaN) && !engine.setPopularityWeight(Double.POSITIVE_INFINITY),
                "recommendation tuning rejects non-finite values");
        check(engine.excludeGenre("Drama") && !engine.excludeGenre(" drama "),
                "excluded genres are unique case-insensitively");
        check(noUser.isColdStartUser() == false && noUser.getColdStartRecommendations(3).length == 0,
                "null-user cold-start checks remain safe");
        check(engine.getColdStartRecommendations(4).length <= 4,
                "cold-start recommendations honor limit and candidate filtering");
        check(noUser.calculateSimilarity(user) == 0.0,
                "null-user similarity returns safe zero");
        check(engine.getCollaborativeRecommendations(user, 3).length == 0,
                "collaborative recommendations require valid requester");



        // Playback queue regression checks: cursor stability and cleanup.
        Movies queueA = new Movies("Queue A", "Drama", 90);
        Movies queueB = new Movies("Queue B", "Comedy", 95);
        Movies queueC = new Movies("Queue C", "Action", 100);
        PlaybackQueue queue = new PlaybackQueue(5);
        check(queue.add(queueA) && queue.add(queueB) && queue.add(queueC),
                "queue accepts valid items");
        check(queue.next() == queueB, "queue advances to second item");
        check(queue.remove(queueB), "remove current item succeeds");
        check(queue.getCurrent() == queueC && queue.getCurrentIndex() == 1,
                "removing current selects next item safely");
        check(queue.remove(queueC), "remove current tail succeeds");
        check(queue.getCurrent() == queueA && queue.getCurrentIndex() == 0,
                "removing tail keeps cursor in range");
        check(queue.next() == null, "queue reaches end safely");
        check(queue.next() == queueA, "next after end restarts from first item");
        queue.clear();
        check(queue.getQueueCount() == 0 && queue.getCurrent() == null
                && queue.getHistoryCount() == 0, "clear resets queue and history");
        check(queue.addNext(queueC) && queue.getCurrent() == queueC,
                "add-next initializes cursor after clear");

        PlaybackQueue shuffleQueue = new PlaybackQueue(3);
        shuffleQueue.add(queueA);
        shuffleQueue.add(queueB);
        shuffleQueue.setShuffleEnabled(true);
        check(shuffleQueue.next() != null, "shuffle advances with multiple entries");
        check(shuffleQueue.getCurrent() != null, "shuffle current remains valid");
        check(!shuffleQueue.setPlaybackSpeed(Double.NaN)
                && !shuffleQueue.setPlaybackSpeed(Double.POSITIVE_INFINITY),
                "playback speed rejects non-finite values");
        PlaybackQueue repeatQueue = new PlaybackQueue(2);
        repeatQueue.add(queueA);
        repeatQueue.setRepeatOne(true);
        check(repeatQueue.next() == queueA && repeatQueue.getHistoryCount() == 0,
                "repeat-one playback does not pollute previous history");
        check(repeatQueue.setPlaybackSpeed(1.25), "valid playback speed accepted");

        // Watch-party membership, playback, and moderation edge cases.
        NETFLIX_USER host = new NETFLIX_USER("party-host");
        NETFLIX_USER guest = new NETFLIX_USER("party-guest");
        WatchParty party = new WatchParty("Regression Party", queueA, host);
        check(!party.invite(host), "watch party cannot invite host as guest");
        check(party.invite(guest), "watch party accepts guest");
        NETFLIX_USER secondGuest = new NETFLIX_USER("party-guest-two");
        check(party.invite(secondGuest), "watch party accepts another guest");
        check(!party.setMaxGuests(0) && !party.setMaxGuests(1),
                "guest capacity cannot drop below existing membership");
        check(!party.invite(guest), "watch party rejects duplicate guest");
        check(party.muteGuest(guest), "host can mute a guest");
        check(!party.sendChat(guest, "hello"), "muted guest chat is blocked");
        party.unmuteGuest(guest);
        check(!party.sendChat(guest, new String(new char[501]).replace("\\0", "x")),
                "watch-party chat enforces message length");
        check(!party.sendReaction(guest, new String(new char[33]).replace("\\0", "x")),
                "watch-party reactions enforce size limit");
        party.muteGuest(guest);
        check(party.removeGuest(guest), "guest can be removed");
        check(!party.isMuted(guest), "removed guest mute state is cleared");
        check(!party.setPlaybackPosition(-1), "watch party rejects negative position");
        check(party.setPlaybackPosition(20), "watch party accepts valid position");
        party.play();
        check(!party.syncGuestPosition(-5), "sync rejects invalid guest position");
        party.endParty();
        check(!party.invite(guest), "ended party cannot invite guests");
        party.restartParty();
        check(!party.isPlaying() && party.getPlaybackPosition() == 0,
                "restart resets playback state");

        // Promo codes and wallet defensive behavior.
        Subscription promoSubscription = new Subscription("Pro");
        PromoCode promo = new PromoCode(" save10 ", 10.0, 1);
        check(promo.redeem(promoSubscription), "promo redeems valid subscription");
        check(Math.abs(promoSubscription.getEffectiveMonthlyFee() - 630.0) < 0.001,
                "promo discount applies correctly");
        check(!promo.redeem(promoSubscription), "single-use promo cannot be redeemed twice");
        PromoCode invalidPromo = new PromoCode("INVALID", 120.0, 2);
        check(!invalidPromo.isValid(), "invalid promo discount is rejected");
        check(!new PromoCode("  ", 10.0, 1).isValid(),
                "blank promo code is invalid rather than defaulting");
        check(!new PromoCode("ZERO-USE", 10.0, 0).isValid(),
                "promo with no uses allowed is invalid");
        MovieReview cappedReview = new MovieReview("Test", 9.5, "Good");
        cappedReview.addHelpfulVote();
        cappedReview.addNotHelpfulVote();
        check(cappedReview.getHelpfulnessScore() == 0, "review votes balance");

        PaymentWallet wallet = new PaymentWallet(2);
        PaymentMethod paymentA = new PaymentMethod("Card", "12345678", "Test");
        PaymentMethod paymentB = new PaymentMethod("Card", "87654321", "Test");
        check(wallet.addMethod(paymentA) && wallet.addMethod(paymentB),
                "wallet accepts methods within capacity");
        check(wallet.getDefaultMethod() == paymentA, "first wallet method is default");
        check(wallet.setDefault(paymentB), "wallet can switch default method");
        check(wallet.removeMethod(paymentB), "wallet removes method");
        check(wallet.getDefaultMethod() == paymentA, "wallet reassigns default after removal");

        Subscription trialSubscription = new Subscription("Pro");
        check(trialSubscription.startTrial(7), "trial starts within supported limit");
        for (int day = 0; day < 7; day++) {
            check(trialSubscription.consumeTrialDay(), "trial day consumption accepted");
        }
        check(!trialSubscription.isInTrial() && !trialSubscription.startTrial(3),
                "expired trial cannot be restarted on same subscription");
        check(!trialSubscription.startTrial(3651), "trial duration is bounded");
        Subscription cancelledTrial = new Subscription("Pro");
        check(cancelledTrial.startTrial(14), "trial cancellation fixture starts");
        cancelledTrial.cancel();
        check(!cancelledTrial.isInTrial() && cancelledTrial.getTrialDaysRemaining() == 0,
                "cancel terminates trial state");

        Subscription billing = new Subscription("Pro");
        billing.setPaymentMethod("Visa **** 4242");
        check(billing.processPayment(700.0), "configured subscription payment succeeds");
        check(billing.getInvoiceCount() == 1 && billing.getInvoiceStatuses()[0].equals("Paid"),
                "successful payment creates paid invoice");
        check(billing.refundInvoice(0), "paid invoice can be refunded");
        check(!billing.refundInvoice(0), "invoice cannot be refunded twice");
        check(Math.abs(billing.getRefundedAmount() - 700.0) < 0.001,
                "refund total is not double counted");
        check(Math.abs(billing.getNetPaid()) < 0.001,
                "net paid correctly subtracts refunds");
        check(!billing.processPayment(Double.NaN), "payment rejects NaN");
        check(!billing.processPayment(-1.0), "payment rejects negative amount");
        billing.pauseBilling();
        billing.processFailedPayment();
        check(billing.getFailedPaymentCount() == 0,
                "paused subscription ignores failed payment event");
        check(billing.resumeBilling(), "paused subscription resumes");
        NETFLIX_USER profileOwner = new NETFLIX_USER("profile-owner");
        NETFLIX_USER childProfile = new NETFLIX_USER("child-profile");
        check(!profileOwner.addFamilyProfile(profileOwner),
                "profile cannot add itself to family profiles");
        check(profileOwner.addFamilyProfile(childProfile),
                "family profile can be added");
        check(!profileOwner.addFamilyProfile(childProfile),
                "duplicate family profile is rejected");
        check(!profileOwner.setPassword("short"),
                "password setter rejects short passwords");
        check(profileOwner.setPassword("long-enough-password"),
                "password setter accepts longer password");
        NETFLIX_USER emailProfile = new NETFLIX_USER("  profile  ", "user@example.com", "Free", "password");
        check("profile".equals(emailProfile.getUsername())
                && "profile".equals(emailProfile.getProfileName()),
                "profile identity trims whitespace");
        check(emailProfile.isValidEmail(), "valid email is accepted");
        emailProfile.setEmail("user@localhost");
        check(!emailProfile.isValidEmail(), "email without domain suffix is rejected");
        emailProfile.setEmail("user@@example.com");
        check(!emailProfile.isValidEmail(), "multiple email separators are rejected");
        emailProfile.setEmail("user name@example.com");
        check(!emailProfile.isValidEmail(), "email whitespace is rejected");
        emailProfile.setEmail("user..name@example.com");
        check(!emailProfile.isValidEmail(), "consecutive local-part dots are rejected");
        Movies defensiveMovie = new Movies(null, "  ", -10);
        check("Untitled".equals(defensiveMovie.getTitle())
                && "Unknown".equals(defensiveMovie.getGenre())
                && defensiveMovie.getDuration() == 0,
                "movie constructor normalizes invalid metadata");
        Movies safeMovie = new Movies("Overflow Safety", "Drama", 1440);
        check(!safeMovie.setRating(Double.NaN) && !safeMovie.setRating(Double.POSITIVE_INFINITY),
                "movie rating rejects non-finite values");
        check(!safeMovie.addUserRating(Double.NaN)
                && !safeMovie.addUserRating(Double.NEGATIVE_INFINITY),
                "community ratings reject non-finite values");
        check(safeMovie.addUserRating(8.5) && safeMovie.getUserRatingCount() == 1,
                "valid community rating updates count");
        safeMovie.like();
        safeMovie.dislike();
        check(safeMovie.getLikeScore() == 0, "like score handles balanced votes");
        safeMovie.recordView();
        safeMovie.recordWatchSeconds(60);
        check(safeMovie.getTotalWatchSeconds() == 60 && safeMovie.getCompletionCount() == 0,
                "watch tracking ignores incomplete view");
        safeMovie.recordWatchSeconds(86400);
        check(safeMovie.isWatched() && safeMovie.getCompletionCount() == 1,
                "full duration marks movie watched");
        check(Movies.getTotalDuration() == 460, "catalog duration remains consistent");
        Movies completedMovie = new Movies("Nearly Finished", "Drama", 100);
        check(profileOwner.updateViewingProgress(completedMovie, 96),
                "new near-complete movie progress accepted");
        check(completedMovie.isWatched()
                && profileOwner.getContinueWatchingCount() == 0,
                "near-complete movie is marked watched without queue residue");
        OfflineDownloadManager downloads = new OfflineDownloadManager(3);
        Movies offlineMovie = new Movies("Offline Test", "Drama", 60);
        offlineMovie.setDownloadAvailable(true);
        check(downloads.addDownload(offlineMovie), "download manager accepts available title");
        check(downloads.updateProgress(offlineMovie, 100), "download completion succeeds");
        check(downloads.getUsedStorageMB() == 120, "standard download storage is tracked");
        downloads.setDownloadQuality("4K");
        check(downloads.removeDownload(offlineMovie), "download can be removed");
        check(downloads.getUsedStorageMB() == 0,
                "storage removal uses recorded size rather than current quality");
        Movies monotonicMovie = new Movies("Monotonic Download", "Drama", 40);
        monotonicMovie.setDownloadAvailable(true);
        check(downloads.addDownload(monotonicMovie), "monotonic download added");
        check(downloads.updateProgress(monotonicMovie, 100), "download can complete");
        long completedStorage = downloads.getUsedStorageMB();
        check(!downloads.updateProgress(monotonicMovie, 50)
                && downloads.getUsedStorageMB() == completedStorage,
                "completed download cannot regress or corrupt storage accounting");
        check(!downloads.markFailed(monotonicMovie, "late failure"),
                "completed download cannot be marked failed");
        downloads.setStorageCapacityMB(0);
        check(downloads.getStorageCapacityMB() >= completedStorage,
                "capacity cannot be lowered below current usage");
        check(downloads.removeDownload(monotonicMovie)
                && downloads.getUsedStorageMB() == 0, "completed storage freed exactly once");
        Movies failedMovie = new Movies("Retry Test", "Action", 50);
        failedMovie.setDownloadAvailable(true);
        check(downloads.addDownload(failedMovie), "failed-download test item added");
        check(downloads.markFailed(failedMovie, "network"), "download marked failed");
        check(downloads.markFailed(failedMovie, "network retry"), "repeat failure update accepted");
        check(downloads.getFailedCount() == 1, "duplicate failure does not inflate counter");
        check(downloads.removeDownload(failedMovie), "failed item removed");
        check(downloads.getFailedCount() == 0, "removal clears failed counter");

        // Viewing-session state, overflow-safe progress and pause accounting.
        Movies sessionMovie = new Movies("Session Test", "Drama", 90);
        ViewingSession session = new ViewingSession(sessionMovie, profileOwner);
        check(session.getProgressPercent() == 0, "new session progress starts at zero");
        check(!session.pauseAt(-1) && session.isPlaybackActive(),
                "invalid pause position leaves playback unchanged");
        check(session.pauseAt(20) && !session.isPlaybackActive(),
                "pause records progress and pauses playback");
        check(!session.resumeAt(91) && !session.isPlaybackActive(),
                "invalid resume position does not resume");
        check(session.resumeAt(30) && session.isPlaybackActive(),
                "valid resume restarts playback");
        check(session.pauseAt(90) && session.isCompleted() && sessionMovie.isWatched(),
                "completion marks movie watched");
        session.startPlayback();
        check(!session.isPlaybackActive(), "completed session cannot restart accidentally");
        check(session.getTotalSeconds() == 5400 && session.getRemainingSeconds() == 0,
                "session time values are correct");

        // Playlist cursor remains valid after removals and reordering.
        NetflixPlaylist playlist = new NetflixPlaylist("Cursor Test", 3);
        check(playlist.addMovie(queueA) && playlist.addMovie(queueB) && playlist.addMovie(queueC),
                "playlist accepts movies");
        check(playlist.getNextMovie() == queueA, "playlist cursor starts at first movie");
        check(playlist.removeMovie(queueA), "playlist can remove previously played movie");
        check(playlist.getNextMovie() == queueB, "removal does not skip next playlist movie");
        check(playlist.moveMovie(1, 0), "playlist reorders movies");
        check(playlist.getMovieAt(0) == queueC, "playlist move changes item order");
        check(playlist.getTotalDuration() == 195, "playlist total duration excludes removed movie");
        NetflixPlaylist cursorPlaylist = new NetflixPlaylist("Sort Cursor", 3);
        cursorPlaylist.addMovie(queueA);
        cursorPlaylist.addMovie(queueB);
        cursorPlaylist.addMovie(queueC);
        check(cursorPlaylist.getNextMovie() == queueA, "sort cursor fixture consumes first item");
        cursorPlaylist.sortByTitle(false);
        check(cursorPlaylist.getNextMovie() == queueB,
                "sorting playlist preserves the next-up movie");
        cursorPlaylist.sortByRating(true);
        check(cursorPlaylist.getNextMovie() == queueB,
                "rating sort preserves the next-up movie");
        cursorPlaylist.sortByReleaseYear(true);
        check(cursorPlaylist.getNextMovie() == queueA,
                "release-year sort preserves the next-up movie");

        PaymentMethod sanitizedCard = new PaymentMethod("Card", "AB12-34 5678 9XYZ", "Test");
        check(sanitizedCard.getMaskedNumber().endsWith("6789"),
                "payment mask exposes only final numeric digits");
        java.util.Calendar current = java.util.Calendar.getInstance();
        check(sanitizedCard.getExpiryYear() == current.get(java.util.Calendar.YEAR) + 3,
                "payment expiry default uses current calendar year");

        System.out.println("NETFLIX_SMOKE_TEST_OK");
    }

    private static void check(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
