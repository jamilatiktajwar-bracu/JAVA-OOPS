final class UserFeatureSmokeTests {
    static void run() {
        testMovieReview();
        testNetflixUserHistoryConsistency();
        testRecommendationEngineSafety();
        testPlaylistCursorAndDurationSafety();
        testWatchPartyParticipationAndBoundaries();
        testSystemHealthOverflowSafety();
    }

private static void testMovieReview() {
        MovieReview review = new MovieReview("Tester", 8.0, "Initial review");
        SmokeTestSupport.require(!review.wasEdited(), "new review should not be marked edited");
        SmokeTestSupport.require(review.edit("Updated review", 9.0), "valid review edit should succeed");
        SmokeTestSupport.require(review.wasEdited(), "edit flag should not depend on millisecond timestamp resolution");
        SmokeTestSupport.require(review.getUpdatedAt() > review.getCreatedAt(), "edit timestamp should advance monotonically");
        SmokeTestSupport.require(!review.edit(" ", 5.0), "blank review edit should fail");
        SmokeTestSupport.require(review.getRating() == 9.0, "invalid edit must preserve existing rating");
        review.addHelpfulVote();
        review.addNotHelpfulVote();
        SmokeTestSupport.require(review.getHelpfulnessScore() == 0, "vote score should reflect both vote types");
        SmokeTestSupport.require(review.report(), "report should be accepted");
        SmokeTestSupport.require(review.needsReview(), "reported review should require moderation");
    }

private static void testNetflixUserHistoryConsistency() {
        NETFLIX_USER user = new NETFLIX_USER("history-tester");
        Movies movie = new Movies("History completion", "Drama", 100);
        SmokeTestSupport.require(user.updateViewingProgress(movie, 40), "partial progress should be tracked");
        SmokeTestSupport.require(user.updateViewingProgress(movie, 95), "completion progress should be accepted");
        SmokeTestSupport.require(user.getContinueWatchingCount() == 0, "completed movie should leave continue-watching");
        SmokeTestSupport.require(user.isInWatchHistory(movie), "completed movie should enter watch history");
        SmokeTestSupport.require(user.watchMovie(movie), "watching an already-recorded movie should succeed");
        SmokeTestSupport.require(user.getWatchHistoryCount() == 1, "re-watch must not duplicate history");
        SmokeTestSupport.require(!user.addFamilyProfile(user), "profile must not add itself as a family profile");
        SmokeTestSupport.require(user.getTotalWatchedMinutes() == 100, "watch time should count unique history entries");
        NETFLIX_USER fullHistory = new NETFLIX_USER("full-history");
        for (int i = 0; i < 100; i++) {
            SmokeTestSupport.require(fullHistory.watchMovie(new Movies("History " + i, "Drama", 1)),
                    "history should accept entries up to its capacity");
        }
        Movies overflowMovie = new Movies("Overflow completion", "Drama", 1);
        SmokeTestSupport.require(fullHistory.updateViewingProgress(overflowMovie, 50),
                "partial progress can be stored while history is full");
        SmokeTestSupport.require(!fullHistory.updateViewingProgress(overflowMovie, 95),
                "completion should fail atomically when history is full");
        SmokeTestSupport.require(fullHistory.getViewingProgress(overflowMovie) == 50,
                "failed completion must preserve previous progress");
        SmokeTestSupport.require(!overflowMovie.isWatched(), "failed completion should not mark movie watched");

    }

private static void testRecommendationEngineSafety() {
        NETFLIX_USER user = new NETFLIX_USER("recommend-tester", "Pro");
        RecommendationEngine engine = new RecommendationEngine(user);
        SmokeTestSupport.require(!engine.setRatingThreshold(Double.NaN), "NaN recommendation threshold should be rejected");
        SmokeTestSupport.require(!engine.setPopularityWeight(Double.POSITIVE_INFINITY), "infinite recommendation weight should be rejected");
        SmokeTestSupport.require(engine.excludeGenre("Drama"), "genre exclusion should succeed");
        SmokeTestSupport.require(!engine.excludeGenre(" drama "), "duplicate excluded genre should be rejected");
        SmokeTestSupport.require(engine.removeExcludedGenre("DRAMA"), "genre exclusion should be case-insensitive");
        Movies[] coldStart = engine.recommend(3);
        SmokeTestSupport.require(coldStart.length <= 3, "cold-start recommendations should respect limit");
        engine.clearRecommendationHistory();
        Movies[] surprise = engine.getSurpriseRecommendations(5);
        for (int i = 0; i < surprise.length; i++) {
            for (int j = i + 1; j < surprise.length; j++) {
                SmokeTestSupport.require(surprise[i] != surprise[j], "surprise recommendations should not contain duplicates");
            }
        }
        RecommendationEngine noUser = new RecommendationEngine(null);
        SmokeTestSupport.require(noUser.recommend(3).length == 0, "null-user recommendation should return empty");
        SmokeTestSupport.require(noUser.getSurpriseRecommendations(3).length == 0, "null-user surprise should return empty");
        SmokeTestSupport.require("No movie or user context".equals(noUser.explainRecommendation(new Movies("Explain", "Drama", 90))),
                "explanation should handle missing user safely");
    }

private static void testPlaylistCursorAndDurationSafety() {
        NetflixPlaylist playlist = new NetflixPlaylist("Cursor", 4);
        Movies first = new Movies("Playlist first", "Drama", 100);
        Movies second = new Movies("Playlist second", "Drama", 200);
        Movies third = new Movies("Playlist third", "Drama", 300);
        SmokeTestSupport.require(playlist.addMovies(new Movies[] {first, second, third}) == 3,
                "bulk add should accept unique movies");
        SmokeTestSupport.require(playlist.getNextMovie() == first, "cursor should begin at first item");
        SmokeTestSupport.require(playlist.removeMovie(first), "removing an item before cursor should succeed");
        SmokeTestSupport.require(playlist.getNextMovie() == second, "cursor should stay aligned after removing passed item");
        SmokeTestSupport.require(playlist.moveMovie(1, 0), "moving item should succeed");
        SmokeTestSupport.require(playlist.getMovieAt(0) == third, "move should reorder playlist");
        SmokeTestSupport.require(playlist.getNextMovie() == third, "cursor should follow moved next item");
        SmokeTestSupport.require(playlist.getTotalDuration() == 500, "playlist duration should sum movie lengths");
        SmokeTestSupport.require(playlist.getRemainingCapacity() == 2, "capacity should track additions");
        SmokeTestSupport.require(!playlist.addMovie(null), "null movie should not be accepted");
    }

private static void testWatchPartyParticipationAndBoundaries() {
        NETFLIX_USER host = new NETFLIX_USER("party-host");
        NETFLIX_USER guest = new NETFLIX_USER("party-guest");
        NETFLIX_USER outsider = new NETFLIX_USER("party-outsider");
        Movies movie = new Movies("Party boundary", "Drama", 90);
        WatchParty party = new WatchParty("Test Party", movie, host);

        SmokeTestSupport.require(!party.invite(host), "host should not be invited as a guest");
        SmokeTestSupport.require(party.invite(guest), "party should accept guest");
        SmokeTestSupport.require(!party.invite(guest), "duplicate guest should be rejected");
        SmokeTestSupport.require(!party.sendChat(outsider, "hello"), "outsider chat should be rejected");
        SmokeTestSupport.require(party.sendChat(guest, "hello"), "participant chat should be accepted");
        SmokeTestSupport.require(!party.sendChat(guest, "spam message"), "moderation should reject spam");
        SmokeTestSupport.require(!party.muteGuest(host), "host should not be muteable as a guest");
        SmokeTestSupport.require(!party.muteGuest(outsider), "outsider should not be muteable");
        SmokeTestSupport.require(party.muteGuest(guest), "active guest should be muteable");
        SmokeTestSupport.require(!party.sendChat(guest, "muted"), "muted guest chat should be rejected");
        SmokeTestSupport.require(party.removeGuest(guest), "guest should be removable");
        SmokeTestSupport.require(!party.isMuted(guest), "removing guest should clear mute state");

        SmokeTestSupport.require(party.setPlaybackPosition(5400), "position at movie end should be valid in seconds");
        SmokeTestSupport.require(!party.setPlaybackPosition(5401), "position beyond movie duration should be rejected");
        party.play();
        SmokeTestSupport.require(!party.syncGuestPosition(-1), "negative sync position should be rejected");
        SmokeTestSupport.require(!party.syncGuestPosition(5401), "sync position beyond movie should be rejected");
        party.endParty();
        SmokeTestSupport.require(!party.invite(outsider), "ended party should not accept invitations");
        SmokeTestSupport.require(!party.sendChat(host, "after end"), "ended party should reject chat");
        SmokeTestSupport.require(!party.muteGuest(guest), "ended party should not allow muting");
        SmokeTestSupport.require(!party.setPlaybackPosition(30), "ended party should reject playback seeks");
        party.play();
        SmokeTestSupport.require(!party.isPlaying(), "ended party should not restart playback implicitly");
        SmokeTestSupport.require(!party.syncGuestPosition(30), "ended party should reject guest synchronization");
        SmokeTestSupport.require(!party.synchronizeAllGuests(30), "ended party should reject host synchronization");
        party.restartParty();
        SmokeTestSupport.require(party.isPartyActive(), "restart should reactivate party");
        SmokeTestSupport.require(!party.isPlaying(), "restart should begin paused");
        SmokeTestSupport.require(party.getPlaybackPosition() == 0, "restart should reset playback position");
        SmokeTestSupport.require(!party.isMuted(guest), "restart should clear stale mute state");
        party.play();
        SmokeTestSupport.require(party.isPlaying(), "active party should play after explicit restart");
    }
    private static void testSystemHealthOverflowSafety() {
        SystemHealthMonitor health = new SystemHealthMonitor();
        health.addUptimeSeconds(Integer.MAX_VALUE);
        health.addUptimeSeconds(100);
        SmokeTestSupport.require(health.getUptimeSeconds() == Integer.MAX_VALUE,
                "uptime accumulation should saturate rather than overflow");
        health.setActiveSessions(10);
        health.setActiveSessions(-1);
        SmokeTestSupport.require(health.getActiveSessions() == 10,
                "negative session counts should not overwrite valid state");
        health.recordWarning();
        SmokeTestSupport.require("Degraded".equals(health.getStatus()),
                "warning threshold should degrade health status");
        health.setMaintenanceMode(true);
        SmokeTestSupport.require("Maintenance".equals(health.getStatus()),
                "maintenance status should take precedence");
    }
}
