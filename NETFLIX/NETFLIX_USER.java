public class NETFLIX_USER {
    /**
     * Legacy public fields retained for source compatibility. Prefer accessors and
     * collection methods because direct writes can bypass validation/invariants.
     */
    @Deprecated
    public String username;
    @Deprecated
    public String email;
    @Deprecated
    public String Plan;
    private String password;
    /** @deprecated Use {@link #getFavouriteMovies()} and favourite methods. */
    @Deprecated
    public Movies[] favourite_movies;
    /** @deprecated Count is maintained by the favourite methods. */
    @Deprecated
    public int favourite_movies_count;
    private Movies[] watchHistory;
    private int watchHistoryCount;
    private Movies[] watchList;
    private int watchListCount;
    private String[] devices;
    private int deviceCount;
    private String profileName;
    private boolean active;
    private Subscription subscription;
    private MovieReview[] reviews;
    private int reviewCount;
    private NetflixPlaylist[] playlists;
    private int playlistCount;
    private Movies[] continueWatching;
    private int[] viewingProgress;
    private int continueWatchingCount;
    private String[] notifications;
    private int notificationCount;
    private NETFLIX_USER[] familyProfiles;
    private int familyProfileCount;
    private boolean autoplay;
    private boolean notificationsEnabled;
    private boolean parentalControlEnabled;
    private int maximumAgeRating;
    private String preferredLanguage;
    private String pin;
    private PaymentWallet paymentWallet;

    public NETFLIX_USER(String username, String email, String PLAN, String password) {
        this.username = username == null || username.trim().isEmpty()
                ? "Guest" : username.trim();
        this.email = email == null ? "" : email.trim();
        this.favourite_movies = new Movies[100];
        this.favourite_movies_count = 0;
        this.watchHistory = new Movies[100];
        this.watchHistoryCount = 0;
        this.watchList = new Movies[100];
        this.watchListCount = 0;
        this.devices = new String[4];
        this.deviceCount = 0;
        this.profileName = this.username;
        this.active = true;
        this.Plan = normalizePlan(PLAN);
        this.subscription = new Subscription(this.Plan);
        this.reviews = new MovieReview[100];
        this.reviewCount = 0;
        this.playlists = new NetflixPlaylist[20];
        this.playlistCount = 0;
        this.continueWatching = new Movies[100];
        this.viewingProgress = new int[100];
        this.continueWatchingCount = 0;
        this.notifications = new String[100];
        this.notificationCount = 0;
        this.familyProfiles = new NETFLIX_USER[5];
        this.familyProfileCount = 0;
        this.autoplay = true;
        this.notificationsEnabled = true;
        this.parentalControlEnabled = false;
        this.maximumAgeRating = 18;
        this.preferredLanguage = "English";
        this.pin = "";
        this.paymentWallet = new PaymentWallet(5);
        this.password = password == null ? "" : password;
    }

    public NETFLIX_USER(String username) {
        this(username, "", "Free", "");
    }

    public NETFLIX_USER(String username, String PLAN) {
        this(username, "", PLAN, "");
    }

    /**
     * Repairs the legacy public favorite-list fields before using them. Direct
     * field writes remain deprecated, but malformed counts, null arrays, and
     * null entries must not make the supported methods throw.
     */
    private int normalizeFavouriteCount() {
        if (favourite_movies == null) {
            favourite_movies = new Movies[100];
            favourite_movies_count = 0;
            return 0;
        }
        int boundedCount = Math.max(0, Math.min(favourite_movies_count, favourite_movies.length));
        int compactedCount = 0;
        for (int i = 0; i < boundedCount; i++) {
            Movies movie = favourite_movies[i];
            if (movie != null) {
                favourite_movies[compactedCount++] = movie;
            }
        }
        for (int i = compactedCount; i < boundedCount; i++) {
            favourite_movies[i] = null;
        }
        favourite_movies_count = compactedCount;
        return compactedCount;
    }

    public void showFavouriteMovies() {
        int count = normalizeFavouriteCount();
        System.out.println("Favourite Movies:");
        for (int i = 0; i < count; i++) {
            System.out.println(favourite_movies[i].getTitle());
        }
        if (count == 0) {
            System.out.println("(none)");
        }
    }

    public boolean addFavouriteMovie(Movies movie) {
        int count = normalizeFavouriteCount();
        if (movie == null || isFavourite(movie)
                || count >= getFavouriteLimit() || count >= favourite_movies.length) {
            return false;
        }
        favourite_movies[favourite_movies_count++] = movie;
        return true;
    }

    public boolean removeFavouriteMovie(Movies movie) {
        int count = normalizeFavouriteCount();
        if (movie == null) {
            return false;
        }
        for (int i = 0; i < count; i++) {
            if (favourite_movies[i] == movie) {
                for (int j = i; j < count - 1; j++) {
                    favourite_movies[j] = favourite_movies[j + 1];
                }
                favourite_movies[--favourite_movies_count] = null;
                return true;
            }
        }
        return false;
    }

    public boolean isFavourite(Movies movie) {
        int count = normalizeFavouriteCount();
        if (movie == null) {
            return false;
        }
        for (int i = 0; i < count; i++) {
            if (favourite_movies[i] == movie) {
                return true;
            }
        }
        return false;
    }

    public boolean watchMovie(Movies movie) {
        if (movie == null) {
            return false;
        }
        // Re-watching an existing entry must not fail just because history is full.
        if (!isInWatchHistory(movie)) {
            if (watchHistoryCount >= watchHistory.length) {
                return false;
            }
            watchHistory[watchHistoryCount++] = movie;
        }
        movie.markWatched();
        removeFromContinueWatching(movie);
        return true;
    }

    public boolean addToWatchList(Movies movie) {
        if (movie == null || isInWatchList(movie) || watchListCount >= watchList.length) {
            return false;
        }
        watchList[watchListCount++] = movie;
        return true;
    }

    public boolean removeFromWatchList(Movies movie) {
        if (movie == null) {
            return false;
        }
        for (int i = 0; i < watchListCount; i++) {
            if (watchList[i] == movie) {
                for (int j = i; j < watchListCount - 1; j++) {
                    watchList[j] = watchList[j + 1];
                }
                watchList[--watchListCount] = null;
                return true;
            }
        }
        return false;
    }

    public boolean isInWatchList(Movies movie) {
        if (movie == null) {
            return false;
        }
        for (int i = 0; i < watchListCount; i++) {
            if (watchList[i] == movie) {
                return true;
            }
        }
        return false;
    }

    public Movies[] getWatchList() {
        Movies[] list = new Movies[watchListCount];
        System.arraycopy(watchList, 0, list, 0, watchListCount);
        return list;
    }

    public int getWatchListCount() {
        return watchListCount;
    }

    public void clearWatchList() {
        for (int i = 0; i < watchListCount; i++) {
            watchList[i] = null;
        }
        watchListCount = 0;
    }

    public boolean addDevice(String deviceName) {
        if (deviceName == null || deviceName.trim().isEmpty()) {
            return false;
        }
        if (deviceCount >= getDeviceLimit()) {
            return false;
        }
        for (int i = 0; i < deviceCount; i++) {
            if (devices[i].equalsIgnoreCase(deviceName.trim())) {
                return false;
            }
        }
        devices[deviceCount++] = deviceName.trim();
        return true;
    }

    public boolean removeDevice(String deviceName) {
        if (deviceName == null) {
            return false;
        }
        for (int i = 0; i < deviceCount; i++) {
            if (devices[i].equalsIgnoreCase(deviceName.trim())) {
                for (int j = i; j < deviceCount - 1; j++) {
                    devices[j] = devices[j + 1];
                }
                devices[--deviceCount] = null;
                return true;
            }
        }
        return false;
    }

    public String[] getDevices() {
        String[] registeredDevices = new String[deviceCount];
        System.arraycopy(devices, 0, registeredDevices, 0, deviceCount);
        return registeredDevices;
    }

    public int getDeviceCount() {
        return deviceCount;
    }

    public int getDeviceLimit() {
        if ("Max".equals(Plan)) {
            return 4;
        }
        if ("Pro".equals(Plan)) {
            return 2;
        }
        return 1;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName == null || profileName.trim().isEmpty()
                ? username : profileName.trim();
    }

    public String getProfileName() {
        return profileName;
    }

    public void deactivate() {
        active = false;
    }

    public void activate() {
        active = true;
    }

    public boolean isActive() {
        return active;
    }

    public boolean isInWatchHistory(Movies movie) {
        if (movie == null) {
            return false;
        }
        for (int i = 0; i < watchHistoryCount; i++) {
            if (watchHistory[i] == movie) {
                return true;
            }
        }
        return false;
    }

    public boolean clearWatchHistory() {
        for (int i = 0; i < watchHistoryCount; i++) {
            watchHistory[i] = null;
        }
        watchHistoryCount = 0;
        return true;
    }

    public Movies[] getWatchHistory() {
        Movies[] history = new Movies[watchHistoryCount];
        System.arraycopy(watchHistory, 0, history, 0, watchHistoryCount);
        return history;
    }

    public int getWatchHistoryCount() {
        return watchHistoryCount;
    }

    public Movies[] getFavouriteMovies() {
        int count = normalizeFavouriteCount();
        Movies[] favourites = new Movies[count];
        System.arraycopy(favourite_movies, 0, favourites, 0, count);
        return favourites;
    }

    public int getFavouriteLimit() {
        if ("Max".equals(Plan)) {
            return 100;
        }
        if ("Pro".equals(Plan)) {
            return 50;
        }
        return 25;
    }

    public boolean canUpgradePlan() {
        return !"Max".equals(Plan);
    }

    public boolean addReview(MovieReview review) {
        if (review == null || !review.isValid() || reviewCount >= reviews.length) {
            return false;
        }
        reviews[reviewCount++] = review;
        return true;
    }

    public MovieReview[] getReviews() {
        MovieReview[] result = new MovieReview[reviewCount];
        System.arraycopy(reviews, 0, result, 0, reviewCount);
        return result;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public boolean createPlaylist(String name) {
        if (playlistCount >= playlists.length) {
            return false;
        }
        playlists[playlistCount++] = new NetflixPlaylist(name);
        return true;
    }

    public NetflixPlaylist getPlaylist(int index) {
        if (index < 0 || index >= playlistCount) {
            return null;
        }
        return playlists[index];
    }

    public NetflixPlaylist[] getPlaylists() {
        NetflixPlaylist[] result = new NetflixPlaylist[playlistCount];
        System.arraycopy(playlists, 0, result, 0, playlistCount);
        return result;
    }

    public boolean removePlaylist(int index) {
        if (index < 0 || index >= playlistCount) {
            return false;
        }
        for (int i = index; i < playlistCount - 1; i++) {
            playlists[i] = playlists[i + 1];
        }
        playlists[--playlistCount] = null;
        return true;
    }

    public int getPlaylistCount() {
        return playlistCount;
    }

    public Subscription getSubscription() {
        return subscription;
    }

    public PaymentWallet getPaymentWallet() {
        return paymentWallet;
    }

    public boolean addPaymentMethod(PaymentMethod method) {
        if (paymentWallet.addMethod(method)) {
            PaymentMethod defaultMethod = paymentWallet.getDefaultMethod();
            if (defaultMethod != null) {
                subscription.setPaymentMethod(defaultMethod.getType());
            }
            return true;
        }
        return false;
    }

    public void cancelSubscription() {
        subscription.cancel();
    }

    public void renewSubscription() {
        subscription.renew();
    }

    public boolean updateViewingProgress(Movies movie, int progressPercent) {
        if (movie == null || progressPercent < 0 || progressPercent > 100) {
            return false;
        }
        for (int i = 0; i < continueWatchingCount; i++) {
            if (continueWatching[i] == movie) {
                if (progressPercent >= 95) {
                    if (!completeMovie(movie)) {
                        return false;
                    }
                    removeContinueWatchingAt(i);
                } else {
                    viewingProgress[i] = progressPercent;
                }
                return true;
            }
        }
        if (progressPercent >= 95) {
            return completeMovie(movie);
        }
        if (continueWatchingCount >= continueWatching.length) {
            return false;
        }
        continueWatching[continueWatchingCount] = movie;
        viewingProgress[continueWatchingCount] = progressPercent;
        continueWatchingCount++;
        return true;
    }

    private boolean completeMovie(Movies movie) {
        if (!isInWatchHistory(movie) && watchHistoryCount >= watchHistory.length) {
            return false;
        }
        movie.markWatched();
        if (!isInWatchHistory(movie)) {
            watchHistory[watchHistoryCount++] = movie;
        }
        return true;
    }

    private void removeContinueWatchingAt(int index) {
        for (int i = index; i < continueWatchingCount - 1; i++) {
            continueWatching[i] = continueWatching[i + 1];
            viewingProgress[i] = viewingProgress[i + 1];
        }
        continueWatchingCount--;
        continueWatching[continueWatchingCount] = null;
        viewingProgress[continueWatchingCount] = 0;
    }

    public boolean removeFromContinueWatching(Movies movie) {
        for (int i = 0; i < continueWatchingCount; i++) {
            if (continueWatching[i] == movie) {
                removeContinueWatchingAt(i);
                return true;
            }
        }
        return false;
    }

    public Movies[] getContinueWatching() {
        Movies[] result = new Movies[continueWatchingCount];
        System.arraycopy(continueWatching, 0, result, 0, continueWatchingCount);
        return result;
    }

    public int getViewingProgress(Movies movie) {
        if (movie == null) {
            return -1;
        }
        for (int i = 0; i < continueWatchingCount; i++) {
            if (continueWatching[i] == movie) {
                return viewingProgress[i];
            }
        }
        return 0;
    }

    public int getContinueWatchingCount() {
        return continueWatchingCount;
    }

    public void clearContinueWatching() {
        for (int i = 0; i < continueWatchingCount; i++) {
            continueWatching[i] = null;
            viewingProgress[i] = 0;
        }
        continueWatchingCount = 0;
    }

    public boolean addNotification(String message) {
        if (message == null || message.trim().isEmpty()
                || notificationCount >= notifications.length
                || !notificationsEnabled) {
            return false;
        }
        notifications[notificationCount++] = message.trim();
        return true;
    }

    public String[] getNotifications() {
        String[] result = new String[notificationCount];
        System.arraycopy(notifications, 0, result, 0, notificationCount);
        return result;
    }

    public int getNotificationCount() {
        return notificationCount;
    }

    public void clearNotifications() {
        for (int i = 0; i < notificationCount; i++) {
            notifications[i] = null;
        }
        notificationCount = 0;
    }

    public void setNotificationsEnabled(boolean enabled) {
        notificationsEnabled = enabled;
    }

    public boolean areNotificationsEnabled() {
        return notificationsEnabled;
    }

    public boolean setAutoplay(boolean enabled) {
        autoplay = enabled;
        return true;
    }

    public boolean isAutoplayEnabled() {
        return autoplay;
    }

    public void setPreferredLanguage(String language) {
        if (language != null && !language.trim().isEmpty()) {
            preferredLanguage = language.trim();
        }
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public boolean enableParentalControl(String pin, int maximumAgeRating) {
        if (pin == null || pin.length() != 4 || maximumAgeRating < 0 || maximumAgeRating > 18) {
            return false;
        }
        for (int i = 0; i < pin.length(); i++) {
            if (!Character.isDigit(pin.charAt(i))) {
                return false;
            }
        }
        this.pin = pin;
        this.maximumAgeRating = maximumAgeRating;
        this.parentalControlEnabled = true;
        return true;
    }

    public boolean disableParentalControl(String pin) {
        if (pin != null && pin.equals(this.pin)) {
            parentalControlEnabled = false;
            this.pin = "";
            return true;
        }
        return false;
    }

    public boolean isParentalControlEnabled() {
        return parentalControlEnabled;
    }

    public int getMaximumAgeRating() {
        return maximumAgeRating;
    }

    public boolean addFamilyProfile(NETFLIX_USER profile) {
        if (profile == null || profile == this || familyProfileCount >= familyProfiles.length) {
            return false;
        }
        for (int i = 0; i < familyProfileCount; i++) {
            if (familyProfiles[i] == profile) {
                return false;
            }
        }
        familyProfiles[familyProfileCount++] = profile;
        return true;
    }

    public NETFLIX_USER[] getFamilyProfiles() {
        NETFLIX_USER[] result = new NETFLIX_USER[familyProfileCount];
        System.arraycopy(familyProfiles, 0, result, 0, familyProfileCount);
        return result;
    }

    public int getFamilyProfileCount() {
        return familyProfileCount;
    }

    public int getTotalWatchedMinutes() {
        long total = 0;
        for (int i = 0; i < watchHistoryCount; i++) {
            total += watchHistory[i].getDuration();
            if (total >= Integer.MAX_VALUE) {
                return Integer.MAX_VALUE;
            }
        }
        return (int) total;
    }

    public Movies[] getRecentlyWatched(int limit) {
        if (limit <= 0 || watchHistoryCount == 0) {
            return new Movies[0];
        }
        int count = Math.min(limit, watchHistoryCount);
        Movies[] recent = new Movies[count];
        for (int i = 0; i < count; i++) {
            recent[i] = watchHistory[watchHistoryCount - 1 - i];
        }
        return recent;
    }

    public String getFavouriteGenre() {
        int count = normalizeFavouriteCount();
        if (count == 0) {
            return "Not available";
        }
        String favouriteGenre = favourite_movies[0].getGenre();
        int highestCount = 0;
        for (int i = 0; i < count; i++) {
            String genre = favourite_movies[i].getGenre();
            int genreCount = 0;
            for (int j = 0; j < count; j++) {
                if (favourite_movies[j].getGenre().equalsIgnoreCase(genre)) {
                    genreCount++;
                }
            }
            if (genreCount > highestCount) {
                highestCount = genreCount;
                favouriteGenre = genre;
            }
        }
        return favouriteGenre;
    }

    public Movies[] recommendByGenre() {
        String genre = getFavouriteGenre();
        if (genre.equals("Not available")) {
            return new Movies[0];
        }
        Movies[] recommendations = Movies.filterByGenre(genre);
        Movies[] result = new Movies[recommendations.length];
        int count = 0;
        for (Movies movie : recommendations) {
            if (!isFavourite(movie) && !isInWatchHistory(movie)) {
                result[count++] = movie;
            }
        }
        Movies[] trimmed = new Movies[count];
        System.arraycopy(result, 0, trimmed, 0, count);
        return trimmed;
    }

    public void displayProfile() {
        System.out.println("Profile: " + profileName);
        System.out.println("Username: " + username);
        System.out.println("Email: " + email);
        System.out.println("Plan: " + Plan);
        System.out.println("Status: " + (active ? "Active" : "Deactivated"));
        System.out.println("Devices: " + deviceCount + "/" + getDeviceLimit());
        System.out.println("Watched movies: " + watchHistoryCount);
        System.out.println("Watch time: " + getTotalWatchedMinutes() + " minutes");
    }

    public void upgradePlan() {
        if ("Free".equals(Plan)) {
            Plan = "Pro";
            subscription.setPlan("Pro");
            System.out.println("Upgraded to Pro plan.");
        } else if ("Pro".equals(Plan)) {
            Plan = "Max";
            subscription.setPlan("Max");
            System.out.println("Upgraded to Max plan.");
        } else if ("Max".equals(Plan)) {
            System.out.println("You are already on the Max plan.");
        }
    }

    private String normalizePlan(String plan) {
        if (plan == null) {
            return "Free";
        }
        String value = plan.trim();
        if (value.equalsIgnoreCase("pro")) {
            return "Pro";
        }
        if (value.equalsIgnoreCase("max")) {
            return "Max";
        }
        return "Free";
    }

    public boolean setPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            return false;
        }
        this.password = password;
        return true;
    }

    /** @deprecated Use {@link #setPassword(String)}. */
    @Deprecated
    public void setpassword(String password) {
        setPassword(password);
    }

    public void setUsername(String username) {
        if (username != null && !username.trim().isEmpty()) {
            this.username = username.trim();
            if (profileName == null || profileName.trim().isEmpty()) {
                profileName = this.username;
            }
        }
    }

    public void setEmail(String email) {
        this.email = email == null ? "" : email.trim();
    }

    /**
     * Validates an email address before changing it. The legacy setter remains
     * available, but this method avoids replacing a valid address on bad input.
     */
    public boolean trySetEmail(String email) {
        if (!isValidEmailAddress(email)) {
            return false;
        }
        this.email = email.trim();
        return true;
    }

    public boolean isValidEmail() {
        return isValidEmailAddress(email);
    }

    private boolean isValidEmailAddress(String candidate) {
        if (candidate == null) {
            return false;
        }
        String value = candidate.trim();
        int atIndex = value.indexOf('@');
        int dotIndex = value.lastIndexOf('.');
        if (value.isEmpty() || atIndex <= 0 || atIndex != value.lastIndexOf('@')
                || dotIndex <= atIndex + 1 || dotIndex >= value.length() - 1
                || value.contains("..")) {
            return false;
        }
        for (int i = 0; i < value.length(); i++) {
            if (Character.isWhitespace(value.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    public void setPlan(String plan) {
        this.Plan = normalizePlan(plan);
        this.subscription.setPlan(this.Plan);
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPlan() {
        return Plan;
    }
}