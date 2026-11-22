public class NETFLIX_DEMO {
    public static void main(String[] args) {
        Movies.clearMovies();
        Movies.addMovie("Interstellar", "Sci-Fi", 169, 2014);
        Movies.addMovie("Avatar", "Sci-Fi", 162, 2009);
        Movies.addMovie("3 Idiots", "Comedy", 170, 2009);

        Movies interstellar = Movies.getMovie(0);
        Movies avatar = Movies.getMovie(1);
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

        NETFLIX_USER user = new NETFLIX_USER(
                "jamila", "jamila@example.com", "Free", "1234");
        user.setProfileName("Jamila");
        user.upgradePlan();
        user.addFavouriteMovie(interstellar);
        user.watchMovie(interstellar);
        user.addToWatchList(avatar);

        user.createPlaylist("Weekend Movies");
        NetflixPlaylist playlist = user.getPlaylist(0);
        playlist.addMovie(interstellar);
        playlist.addMovie(avatar);

        user.addReview(new MovieReview(
                "Jamila", 9.5, "A beautiful and thoughtful movie."));

        System.out.println("===== NETFLIX DEMO =====");
        user.displayProfile();
        System.out.println("\nSubscription:");
        user.getSubscription().display();
        Subscription subscription = user.getSubscription();
        subscription.startTrial(14);
        subscription.applyCoupon("WELCOME20", 20);
        subscription.setBillingCycle("Monthly");
        subscription.setPaymentMethod("Card");
        subscription.processPayment(subscription.getEffectiveMonthlyFee());
        PaymentMethod card = new PaymentMethod(
                "Visa", "4242424242424242", "Jamila Ahmed");
        card.setExpiry(12, 2028);
        user.addPaymentMethod(card);
        PromoCode promo = new PromoCode("NEWYEAR25", 25.0, 3);
        promo.redeem(subscription);
        System.out.println("Trial days: " + subscription.getTrialDaysRemaining());
        System.out.println("Effective fee: " + subscription.getEffectiveMonthlyFee());
        System.out.println("Coupon: " + subscription.getCouponCode());
        System.out.println("Paid: " + subscription.getTotalPaid());
        System.out.println("Payment status: " + subscription.getBillingStatus());
        System.out.println("Invoice count: " + subscription.getInvoiceCount());
        System.out.println("Proration estimate: "
                + subscription.calculateProration(700, 1200, 15, 30));
        System.out.println("Payment method: "
                + user.getPaymentWallet().getDefaultMethod().getMaskedNumber());
        System.out.println("Promo remaining uses: " + promo.getRemainingUses());
        System.out.println("\nWatchlist:");
        for (Movies movie : user.getWatchList()) {
            System.out.println("- " + movie.getTitle());
        }
        System.out.println("\nPlaylists:");
        playlist.display();
        playlist.setDescription("Movies to watch on the weekend");
        playlist.setPublic(true);
        playlist.sortByTitle(true);
        System.out.println("\nSorted playlist:");
        playlist.display();
        System.out.println("Description: " + playlist.getDescription());
        System.out.println("Public: " + playlist.isPublic());
        System.out.println("Playlist duration: "
                + playlist.getTotalDuration() + " minutes");
        System.out.println("Remaining capacity: "
                + playlist.getRemainingCapacity());
        System.out.println("\nReviews:");
        for (MovieReview review : user.getReviews()) {
            review.display();
        }
        System.out.println("\nSettings:");
        user.updateViewingProgress(interstellar, 45);
        user.setAutoplay(false);
        user.setPreferredLanguage("Bangla");
        user.enableParentalControl("1234", 13);
        user.addNotification("Avatar was added to your watchlist");
        System.out.println("Continue watching progress: "
                + user.getViewingProgress(interstellar) + "%");
        System.out.println("Language: " + user.getPreferredLanguage());
        System.out.println("Autoplay: " + user.isAutoplayEnabled());
        System.out.println("Parental control: " + user.isParentalControlEnabled());
        System.out.println("Notifications: " + user.getNotificationCount());
        System.out.println("\nMovie details:");
        interstellar.displayFullInfo();
        System.out.println("Cast: " + interstellar.getCastCount());
        System.out.println("Likes: " + interstellar.getLikes());
        System.out.println("Like score: " + interstellar.getLikeScore());
        System.out.println("Featured movies: "
                + Movies.getFeaturedMovies().length);
        System.out.println("Age-safe movies: "
                + Movies.filterByAgeRating(13).length);
        System.out.println("Search 'space': "
                + Movies.search("space").length);
        System.out.println("Trending: "
                + Movies.getTrendingMovies(1)[0].getTitle());
        System.out.println("Subtitle count: "
                + interstellar.getSubtitles().length);
        System.out.println("Download started: "
                + interstellar.download());
        System.out.println("\nHigh-end features:");
        RecommendationEngine engine = new RecommendationEngine(user);
        Movies[] recommendations = engine.recommend(3);
        System.out.println("Recommendations: " + recommendations.length);
        ViewingSession session = new ViewingSession(avatar, user);
        session.setQuality("4K");
        session.setSubtitleEnabled(true);
        session.pauseAt(75);
        System.out.println("Viewing session: " + session.getProgressPercent()
                + "%, " + session.getQuality());
        WatchParty party = new WatchParty("Friday Movie Night", interstellar, user);
        party.invite(new NETFLIX_USER("guest"));
        party.play();
        System.out.println("Watch party guests: " + party.getGuestCount());
        OfflineDownloadManager downloads = new OfflineDownloadManager(5);
        downloads.addDownload(interstellar);
        downloads.updateProgress(interstellar, 100);
        System.out.println("Offline downloads: " + downloads.getDownloadCount());
        PlaybackQueue queue = new PlaybackQueue(10);
        queue.add(interstellar);
        queue.add(avatar);
        queue.setRepeatAll(true);
        System.out.println("Queue: " + queue.getQueueCount()
                + ", current: " + queue.getCurrent().getTitle());
        System.out.println("Analytics: "
                + CinemaAnalytics.getEngagementSummary(user));
    }
}
