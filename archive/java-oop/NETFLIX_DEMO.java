public class NETFLIX_DEMO {
    private static Movies interstellar;
    private static Movies avatar;
    private static NETFLIX_USER user;
    private static NetflixPlaylist playlist;
    private static Subscription subscription;

    public static void main(String[] args) {
        initializeCatalogAndMovie();
        initializeUserAndLibrary();
        demonstrateSubscription();
        demonstrateLibraryAndReviews();
        demonstrateSettings();
        demonstrateMovieCatalog();
        demonstrateRecommendations();
        demonstrateViewingSession();
        demonstrateWatchParty();
        demonstrateOfflineDownloadsAndQueue();
        demonstrateAnalyticsAndAudit();
    }

    private static void initializeCatalogAndMovie() {
        Movies.clearMovies();
        Movies.addMovie("Interstellar", "Sci-Fi", 169, 2014);
        Movies.addMovie("Avatar", "Sci-Fi", 162, 2009);
        Movies.addMovie("3 Idiots", "Comedy", 170, 2009);
        interstellar = Movies.getMovie(0);
        avatar = Movies.getMovie(1);
        interstellar.setRating(9.5);
        avatar.setRating(8.8);
        interstellar.setAgeRating(13);
        interstellar.setDirector("Christopher Nolan");
        interstellar.setLanguage("English");
        interstellar.setCountry("USA");
        interstellar.setDescription("A team travels through a wormhole to save humanity.");
        interstellar.setTrailerUrl("https://example.com/interstellar-trailer");
        interstellar.setFeatured(true);
        interstellar.addCastMember("Matthew McConaughey");
        interstellar.addCastMember("Anne Hathaway");
        interstellar.like();
        interstellar.like();
        interstellar.recordView();
        interstellar.recordView();
        interstellar.recordView();
        interstellar.setDownloadAvailable(true);
        interstellar.addSubtitle("English");
        interstellar.addSubtitle("Bangla");
        interstellar.addKeyword("space");
        interstellar.addKeyword("space travel");
        interstellar.setPosterUrl("https://example.com/interstellar-poster.jpg");
        interstellar.setMaturityRating("PG-13");
        interstellar.setAudioFormat("Dolby Atmos");
        interstellar.setCaptionsAvailable(true);
        interstellar.addUserRating(9.3);
        interstellar.addUserRating(9.7);
        interstellar.recordWatchSeconds(169 * 60);
    }

    private static void initializeUserAndLibrary() {
        user = new NETFLIX_USER("jamila", "jamila@example.com", "Free", "1234");
        user.setProfileName("Jamila");
        user.upgradePlan();
        user.addFavouriteMovie(interstellar);
        user.watchMovie(interstellar);
        user.addToWatchList(avatar);
        user.createPlaylist("Weekend Movies");
        playlist = user.getPlaylist(0);
        playlist.addMovie(interstellar);
        playlist.addMovie(avatar);
        MovieReview review = new MovieReview("Jamila", 9.5,
                "A beautiful and thoughtful movie.");
        review.setVerifiedViewer(true);
        review.addTag("Sci-Fi");
        review.addTag("Emotional");
        review.addHelpfulVote();
        review.addHelpfulVote();
        user.addReview(review);
        System.out.println("===== NETFLIX DEMO =====");
        user.displayProfile();
    }

    private static void demonstrateSubscription() {
        System.out.println("\nSubscription:");
        user.getSubscription().display();
        subscription = user.getSubscription();
        subscription.startTrial(14);
        subscription.applyCoupon("WELCOME20", 20);
        PromoCode promo = new PromoCode("NEWYEAR25", 25.0, 3);
        promo.redeem(subscription);
        subscription.setBillingCycle("Monthly");
        PaymentMethod card = new PaymentMethod("Visa", "4242424242424242", "Jamila Ahmed");
        card.setExpiry(12, 2028);
        user.addPaymentMethod(card);
        subscription.processPayment(subscription.getEffectiveMonthlyFee());
        System.out.println("Trial days: " + subscription.getTrialDaysRemaining());
        System.out.println("Effective fee: " + subscription.getEffectiveMonthlyFee());
        System.out.println("Coupon: " + subscription.getCouponCode());
        System.out.println("Paid: " + subscription.getTotalPaid());
        System.out.println("Payment status: " + subscription.getBillingStatus());
        System.out.println("Invoice count: " + subscription.getInvoiceCount());
        System.out.println("Proration estimate: " + subscription.calculateProration(700, 1200, 15, 30));
        PaymentMethod defaultMethod = user.getPaymentWallet().getDefaultMethod();
        System.out.println("Payment method: " + (defaultMethod == null ? "None" : defaultMethod.getMaskedNumber()));
        System.out.println("Promo remaining uses: " + promo.getRemainingUses());
    }

    private static void demonstrateLibraryAndReviews() {
        System.out.println("\nWatchlist:");
        for (Movies movie : user.getWatchList()) System.out.println("- " + movie.getTitle());
        System.out.println("\nPlaylists:");
        playlist.display();
        playlist.setDescription("Movies to watch on the weekend");
        playlist.setPublic(true);
        playlist.sortByTitle(true);
        System.out.println("\nSorted playlist:");
        playlist.display();
        System.out.println("Description: " + playlist.getDescription());
        System.out.println("Public: " + playlist.isPublic());
        System.out.println("Playlist duration: " + playlist.getTotalDuration() + " minutes");
        System.out.println("Remaining capacity: " + playlist.getRemainingCapacity());
        System.out.println("\nReviews:");
        for (MovieReview review : user.getReviews()) review.display();
    }

    private static void demonstrateSettings() {
        System.out.println("\nSettings:");
        user.updateViewingProgress(interstellar, 45);
        user.setAutoplay(false);
        user.setPreferredLanguage("Bangla");
        user.enableParentalControl("1234", 13);
        user.addNotification("Avatar was added to your watchlist");
        System.out.println("Continue watching progress: " + user.getViewingProgress(interstellar) + "%");
        System.out.println("Language: " + user.getPreferredLanguage());
        System.out.println("Autoplay: " + user.isAutoplayEnabled());
        System.out.println("Parental control: " + user.isParentalControlEnabled());
        System.out.println("Notifications: " + user.getNotificationCount());
    }

    private static void demonstrateMovieCatalog() {
        System.out.println("\nMovie details:");
        interstellar.displayFullInfo();
        System.out.println("Cast: " + interstellar.getCastCount());
        System.out.println("Likes: " + interstellar.getLikes());
        System.out.println("Like score: " + interstellar.getLikeScore());
        System.out.println("Featured movies: " + Movies.getFeaturedMovies().length);
        System.out.println("Age-safe movies: " + Movies.filterByAgeRating(13).length);
        System.out.println("Search 'space': " + Movies.search("space").length);
        Movies[] trending = Movies.getTrendingMovies(1);
        System.out.println("Trending: " + (trending.length == 0 ? "None" : trending[0].getTitle()));
        System.out.println("Subtitle count: " + interstellar.getSubtitles().length);
        System.out.println("Download started: " + interstellar.download());
    }

    private static void demonstrateRecommendations() {
        System.out.println("\nHigh-end features:");
        RecommendationEngine engine = new RecommendationEngine(user);
        engine.setRatingThreshold(7.0);
        engine.setDiversityEnabled(true);
        engine.setFreshOnly(true);
        engine.setRatingWeight(1.5);
        engine.setGenreWeight(1.2);
        engine.setPersonalizationStrength(1.3);
        Movies[] recommendations = engine.recommend(3);
        System.out.println("Recommendations: " + recommendations.length);
        if (recommendations.length > 0) System.out.println("Recommendation reason: " + engine.explainRecommendation(recommendations[0]));
        System.out.println("Recommendation engine: " + engine.getEngineHealth());
    }

    private static void demonstrateViewingSession() {
        ViewingSession session = new ViewingSession(avatar, user);
        session.setQuality("4K");
        session.setSubtitleEnabled(true);
        session.setPlaybackSpeed(1.25);
        session.setBandwidthMbps(30);
        session.setHdrEnabled(true);
        session.setDolbyAtmosEnabled(true);
        session.setVolume(85);
        session.setIntroRange(0, 90);
        session.setSkipIntroEnabled(true);
        session.addBookmark(2700);
        session.setLowDataMode(false);
        session.setAudioDescriptionEnabled(true);
        session.setDeviceName("Smart TV");
        session.setNetworkType("Fiber");
        session.sendHeartbeat();
        session.pauseAt(75);
        System.out.println("Viewing session: " + session.getProgressPercent() + "%, " + session.getQuality());
        System.out.println("Session speed: " + session.getPlaybackSpeed() + "x, bandwidth: " + session.getBandwidthMbps()
                + "Mbps, HDR: " + session.isHdrEnabled() + ", Atmos: " + session.isDolbyAtmosEnabled());
        System.out.println("Session device: " + session.getDeviceName() + ", network: " + session.getNetworkType()
                + ", bookmarks: " + session.getBookmarkCount() + ", heartbeat: " + session.getHeartbeatCount());
    }

    private static void demonstrateWatchParty() {
        WatchParty party = new WatchParty("Friday Movie Night", interstellar, user);
        NETFLIX_USER guest = new NETFLIX_USER("guest");
        party.invite(guest);
        party.play();
        party.sendChat(user, "Welcome everyone!");
        party.sendChat(guest, "Ready to watch!");
        party.sendReaction(guest, "Amazing!");
        party.setPlaybackPosition(90);
        party.synchronizeAllGuests(95);
        System.out.println("Watch party guests: " + party.getGuestCount());
        System.out.println("Party chat: " + party.getChatCount() + ", reactions: " + party.getReactionCount()
                + ", synced position: " + party.getLastSyncPosition());
    }

    private static void demonstrateOfflineDownloadsAndQueue() {
        OfflineDownloadManager downloads = new OfflineDownloadManager(5);
        downloads.addDownload(interstellar);
        downloads.updateProgress(interstellar, 100);
        downloads.setStorageCapacityMB(5000);
        downloads.setDownloadQuality("HD");
        downloads.setWifiOnly(true);
        downloads.setPriority(interstellar, 90);
        System.out.println("Offline downloads: " + downloads.getDownloadCount());
        System.out.println("Download quality: " + downloads.getDownloadQuality() + ", Wi-Fi only: " + downloads.isWifiOnly()
                + ", priority: " + downloads.getPriority(interstellar) + ", storage remaining: " + downloads.getRemainingStorageMB() + " MB");
        PlaybackQueue queue = new PlaybackQueue(10);
        queue.add(interstellar);
        queue.add(avatar);
        queue.setRepeatAll(true);
        queue.setPlaybackSpeed(1.5);
        queue.setCrossfadeSeconds(5);
        queue.setSubtitlesEnabled(true);
        queue.setSubtitleLanguage("Bangla");
        System.out.println("Queue: " + queue.getQueueCount() + ", current: " + queue.getCurrent().getTitle());
        System.out.println("Queue speed: " + queue.getPlaybackSpeed() + "x, crossfade: " + queue.getCrossfadeSeconds()
                + "s, subtitles: " + queue.areSubtitlesEnabled());
    }

    private static void demonstrateAnalyticsAndAudit() {
        System.out.println("Analytics: " + CinemaAnalytics.getEngagementSummary(user));
        System.out.println("Advanced analytics: " + CinemaAnalytics.getAnalyticsSummary(user));
        System.out.println("Library analytics: " + LibraryAnalytics.getExtendedSummary());
        System.out.println("Content health: " + ContentHealthReport.getSummary());
        System.out.println("Accessibility: " + AccessibilityAnalytics.getSummary());
        AdminAuditLog audit = new AdminAuditLog(20);
        audit.record("Jamila", "Updated profile settings");
        audit.record("Admin", "Published weekly catalog");
        SystemHealthMonitor health = new SystemHealthMonitor();
        health.addUptimeSeconds(86400);
        health.setActiveSessions(125);
        health.recordWarning();
        System.out.println("Audit entries: " + audit.getLogCount() + ", Latest: " + audit.getLatestAction());
    }
}
