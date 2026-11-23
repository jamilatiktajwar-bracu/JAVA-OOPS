public class Movies {
    private String title;
    private String genre;
    private int duration;
    private int releaseYear;
    private double rating;
    private boolean watched;
    private int ageRating;
    private String director;
    private String description;
    private String language;
    private String country;
    private String trailerUrl;
    private boolean featured;
    private int likes;
    private int dislikes;
    private String[] cast;
    private int castCount;
    private String releaseStatus;
    private int viewCount;
    private int downloadCount;
    private boolean streamingAvailable;
    private boolean downloadAvailable;
    private String[] subtitles;
    private int subtitleCount;
    private String[] keywords;
    private int keywordCount;
    private String posterUrl;
    private String maturityRating;
    private String audioFormat;
    private boolean captionsAvailable;
    private int totalWatchSeconds;
    private int completionCount;
    private int userRatingCount;
    private double userRatingTotal;

    private bookmark[] bookmarks = new bookmark[100];

    public Movies(String title, String genre, int duration) {
        this.title = title == null || title.trim().isEmpty() ? "Untitled" : title.trim();
        this.genre = genre == null || genre.trim().isEmpty() ? "Unknown" : genre.trim();
        this.duration = duration >= 0 && duration <= 1440 ? duration : 0;
        this.releaseYear = 0;
        this.rating = 0.0;
        this.watched = false;
        this.ageRating = 0;
        this.director = "Unknown";
        this.description = "";
        this.language = "English";
        this.country = "Unknown";
        this.trailerUrl = "";
        this.featured = false;
        this.likes = 0;
        this.dislikes = 0;
        this.cast = new String[20];
        this.castCount = 0;
        this.releaseStatus = "Released";
        this.viewCount = 0;
        this.downloadCount = 0;
        this.streamingAvailable = true;
        this.downloadAvailable = false;
        this.subtitles = new String[20];
        this.subtitleCount = 0;
        this.keywords = new String[30];
        this.keywordCount = 0;
        this.posterUrl = "";
        this.maturityRating = "Not Rated";
        this.audioFormat = "Stereo";
        this.captionsAvailable = false;
        this.totalWatchSeconds = 0;
        this.completionCount = 0;
        this.userRatingCount = 0;
        this.userRatingTotal = 0.0;
    }

    public Movies(String title, String genre) {
        this(title, genre, 0);
    }

    public Movies(String title, String genre, int duration, int releaseYear) {
        this(title, genre, duration);
        setReleaseYear(releaseYear);
    }

    public Movies(bookmark[] bookmarks) {
        this.bookmarks = new bookmark[100];
        if (bookmarks != null) {
            int length = Math.min(bookmarks.length, this.bookmarks.length);
            System.arraycopy(bookmarks, 0, this.bookmarks, 0, length);
        }
        this.title = "Untitled";
        this.genre = "Unknown";
        this.duration = 0;
        this.releaseYear = 0;
        this.rating = 0.0;
        this.watched = false;
        this.ageRating = 0;
        this.director = "Unknown";
        this.description = "";
        this.language = "English";
        this.country = "Unknown";
        this.trailerUrl = "";
        this.featured = false;
        this.likes = 0;
        this.dislikes = 0;
        this.cast = new String[20];
        this.castCount = 0;
        this.releaseStatus = "Released";
        this.viewCount = 0;
        this.downloadCount = 0;
        this.streamingAvailable = true;
        this.downloadAvailable = false;
        this.subtitles = new String[20];
        this.subtitleCount = 0;
        this.keywords = new String[30];
        this.keywordCount = 0;
        this.posterUrl = "";
        this.maturityRating = "Not Rated";
        this.audioFormat = "Stereo";
        this.captionsAvailable = false;
        this.totalWatchSeconds = 0;
        this.completionCount = 0;
        this.userRatingCount = 0;
        this.userRatingTotal = 0.0;
    }

    public void movieadd(String title, String genre, int duration) {
        addMovie(title, genre, duration);
    }

    public void addBookmark(bookmark bookmark) {
        if (bookmark == null) {
            System.out.println("Invalid bookmark.");
            return;
        }

        for (int i = 0; i < bookmarks.length; i++) {
            if (bookmarks[i] == null) {
                bookmarks[i] = bookmark;
                return;
            }
        }

        System.out.println("Bookmark list is full. Cannot add more bookmarks.");
    }

    public boolean removeBookmark(bookmark target) {
        for (int i = 0; i < bookmarks.length; i++) {
            if (bookmarks[i] == target) {
                for (int j = i; j < bookmarks.length - 1; j++) {
                    bookmarks[j] = bookmarks[j + 1];
                }
                bookmarks[bookmarks.length - 1] = null;
                return true;
            }
        }
        return false;
    }

    public int getBookmarkCount() {
        int count = 0;
        for (bookmark item : bookmarks) {
            if (item != null) {
                count++;
            }
        }
        return count;
    }

    public void clearBookmarks() {
        for (int i = 0; i < bookmarks.length; i++) {
            bookmarks[i] = null;
        }
    }

    public void setBookmarks(bookmark[] bookmarks) {
        if (bookmarks == null) {
            this.bookmarks = new bookmark[100];
            return;
        }

        this.bookmarks = new bookmark[100];
        int length = Math.min(bookmarks.length, this.bookmarks.length);
        System.arraycopy(bookmarks, 0, this.bookmarks, 0, length);
    }

    public bookmark[] getBookmarks() {
        int count = getBookmarkCount();
        bookmark[] result = new bookmark[count];
        int position = 0;
        for (bookmark item : bookmarks) {
            if (item != null) {
                result[position++] = item;
            }
        }
        return result;
    }

    public void history() {
        System.out.println("Movie Title: " + title);
        System.out.println("Genre: " + genre);
        System.out.println("Duration: " + duration + " minutes");
    }

    public void bookmark() {
        System.out.println("Movie " + title + " has been bookmarked.");
    }

    public static boolean addMovie(String title, String genre, int duration) {
        return MovieCatalog.addMovie(title, genre, duration) != null;
    }

    public static boolean addMovie(String title, String genre) {
        return MovieCatalog.addMovie(title, genre, 0) != null;
    }

    public static boolean addMovie(String title, String genre, int duration, int releaseYear) {
        Movies movie = MovieCatalog.addMovie(title, genre, duration);
        if (movie == null) {
            return false;
        }
        movie.setReleaseYear(releaseYear);
        return true;
    }

    public static boolean removeMovie(int index) {
        return MovieCatalog.removeMovie(index);
    }

    public static boolean removeMovie(String title) {
        return MovieCatalog.removeMovie(title);
    }

    public static Movies[] searchByTitle(String keyword) { return MovieCatalog.searchByTitle(keyword); }

    public static Movies[] filterByGenre(String genre) { return MovieCatalog.filterByGenre(genre); }

    public static Movies[] getAllMovies() { return MovieCatalog.getAll(); }

    public static Movies[] getWatchedMovies() { return MovieCatalog.getWatchedMovies(); }

    public static Movies[] getUnwatchedMovies() { return MovieCatalog.getUnwatchedMovies(); }

    public static Movies[] filterByReleaseYear(int fromYear, int toYear) { return MovieCatalog.filterByReleaseYear(fromYear, toYear); }

    public static Movies[] filterByAgeRating(int maximumAge) { return MovieCatalog.filterByAgeRating(maximumAge); }

    public static Movies[] filterByLanguage(String language) { return MovieCatalog.filterByLanguage(language); }

    public static Movies[] getFeaturedMovies() { return MovieCatalog.getFeaturedMovies(); }

    public static Movies[] getTopRatedMovies(int limit) { return MovieCatalog.getTopRatedMovies(limit); }

    public static String[] getAvailableGenres() { return MovieCatalog.getAvailableGenres(); }

    public static Movies[] search(String keyword) { return MovieCatalog.search(keyword); }

    public static Movies[] getAvailableForStreaming() { return MovieCatalog.getAvailableForStreaming(); }

    public static Movies[] getTrendingMovies(int limit) { return MovieCatalog.getTrendingMovies(limit); }

    public static Movies[] getNewReleases(int fromYear) { return MovieCatalog.getNewReleases(fromYear); }

    public static Movies[] getUpcomingMovies() { return MovieCatalog.getUpcomingMovies(); }

    public static Movies[] sortByTitle(boolean ascending) { return MovieCatalog.sortByTitle(ascending); }

    public static Movies[] sortByRating(boolean descending) { return MovieCatalog.sortByRating(descending); }

    public static Movies[] sortByReleaseYear(boolean descending) { return MovieCatalog.sortByReleaseYear(descending); }

    public static double getAverageRating() {
        if (MovieCatalog.count == 0) {
            return 0.0;
        }
        double total = 0.0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            total += MovieCatalog.movies[i].getRating();
        }
        return total / MovieCatalog.count;
    }

    public static int getTotalDuration() {
        int total = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            total += MovieCatalog.movies[i].getDuration();
        }
        return total;
    }

    public static Movies getHighestRatedMovie() {
        if (MovieCatalog.count == 0) {
            return null;
        }
        Movies highest = MovieCatalog.movies[0];
        for (int i = 1; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].getRating() > highest.getRating()) {
                highest = MovieCatalog.movies[i];
            }
        }
        return highest;
    }

    public static Movies getLongestMovie() {
        if (MovieCatalog.count == 0) {
            return null;
        }
        Movies longest = MovieCatalog.movies[0];
        for (int i = 1; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].getDuration() > longest.getDuration()) {
                longest = MovieCatalog.movies[i];
            }
        }
        return longest;
    }

    public static int getWatchedCount() {
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].isWatched()) {
                count++;
            }
        }
        return count;
    }

    public static void clearMovies() {
        MovieCatalog.clear();
    }

    private static Movies[] copyMovies(Movies[] source, int count) {
        Movies[] result = new Movies[count];
        System.arraycopy(source, 0, result, 0, count);
        return result;
    }

    public static Movies getMovie(int index) {
        if (index < 0 || index >= MovieCatalog.count) {
            throw new IndexOutOfBoundsException("Invalid movie index: " + index);
        }
        return MovieCatalog.movies[index];
    }

    public static int getMovieCount() {
        return MovieCatalog.count;
    }

    public void play() {
        System.out.println("Playing " + title + " (" + genre + ", " + duration + " minutes)");
    }

    public void displayInfo() {
        System.out.println("Title: " + title);
        System.out.println("Genre: " + genre);
        System.out.println("Duration: " + duration + " minutes");
    }

    public String getTitle() {
        return title;
    }

    public String getGenre() {
        return genre;
    }

    public int getDuration() {
        return duration;
    }

    public boolean setTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            return false;
        }
        this.title = title.trim();
        return true;
    }

    public boolean setGenre(String genre) {
        if (genre == null || genre.trim().isEmpty()) {
            return false;
        }
        this.genre = genre.trim();
        return true;
    }

    public boolean setDuration(int duration) {
        if (duration < 0 || duration > 1440) {
            return false;
        }
        this.duration = duration;
        return true;
    }

    public boolean setReleaseYear(int releaseYear) {
        if (releaseYear < 1888 || releaseYear > 2200) {
            return false;
        }
        this.releaseYear = releaseYear;
        return true;
    }

    public int getReleaseYear() {
        return releaseYear;
    }

    public boolean setRating(double rating) {
        if (!Double.isFinite(rating) || rating < 0.0 || rating > 10.0) {
            return false;
        }
        this.rating = rating;
        return true;
    }

    public double getRating() {
        return rating;
    }

    public void markWatched() {
        this.watched = true;
    }

    public void markUnwatched() {
        this.watched = false;
    }

    public boolean isWatched() {
        return watched;
    }

    public boolean setAgeRating(int ageRating) {
        if (ageRating < 0 || ageRating > 18) {
            return false;
        }
        this.ageRating = ageRating;
        return true;
    }

    public int getAgeRating() {
        return ageRating;
    }

    public void setDirector(String director) {
        this.director = director == null || director.trim().isEmpty()
                ? "Unknown" : director.trim();
    }

    public String getDirector() {
        return director;
    }

    public void setDescription(String description) {
        this.description = description == null ? "" : description.trim();
    }

    public String getDescription() {
        return description;
    }

    public void setLanguage(String language) {
        if (language != null && !language.trim().isEmpty()) {
            this.language = language.trim();
        }
    }

    public String getLanguage() {
        return language;
    }

    public void setCountry(String country) {
        if (country != null && !country.trim().isEmpty()) {
            this.country = country.trim();
        }
    }

    public String getCountry() {
        return country;
    }

    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl == null ? "" : trailerUrl.trim();
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public boolean isFeatured() {
        return featured;
    }

    public boolean addCastMember(String actor) {
        if (actor == null || actor.trim().isEmpty() || castCount >= cast.length) {
            return false;
        }
        String value = actor.trim();
        for (int i = 0; i < castCount; i++) {
            if (cast[i].equalsIgnoreCase(value)) {
                return false;
            }
        }
        cast[castCount++] = value;
        return true;
    }

    public boolean removeCastMember(String actor) {
        if (actor == null) {
            return false;
        }
        for (int i = 0; i < castCount; i++) {
            if (cast[i].equalsIgnoreCase(actor.trim())) {
                for (int j = i; j < castCount - 1; j++) {
                    cast[j] = cast[j + 1];
                }
                cast[--castCount] = null;
                return true;
            }
        }
        return false;
    }

    public String[] getCast() {
        String[] result = new String[castCount];
        System.arraycopy(cast, 0, result, 0, castCount);
        return result;
    }

    public int getCastCount() {
        return castCount;
    }

    public void like() {
        if (likes < Integer.MAX_VALUE) {
            likes++;
        }
    }

    public void unlike() {
        if (likes > 0) {
            likes--;
        }
    }

    public void dislike() {
        if (dislikes < Integer.MAX_VALUE) {
            dislikes++;
        }
    }

    public void undislike() {
        if (dislikes > 0) {
            dislikes--;
        }
    }

    public int getLikes() {
        return likes;
    }

    public int getDislikes() {
        return dislikes;
    }

    public int getLikeScore() {
        return likes - dislikes;
    }

    public void setReleaseStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return;
        }
        String value = status.trim();
        if (value.equalsIgnoreCase("Released")
                || value.equalsIgnoreCase("Upcoming")
                || value.equalsIgnoreCase("In Production")) {
            this.releaseStatus = value;
        }
    }

    public String getReleaseStatus() {
        return releaseStatus;
    }

    public boolean isUpcoming() {
        return releaseStatus.equalsIgnoreCase("Upcoming");
    }

    public void recordView() {
        if (viewCount < Integer.MAX_VALUE) {
            viewCount++;
        }
    }

    public int getViewCount() {
        return viewCount;
    }

    public boolean download() {
        if (!downloadAvailable) {
            return false;
        }
        downloadCount++;
        return true;
    }

    public int getDownloadCount() {
        return downloadCount;
    }

    public void setStreamingAvailable(boolean available) {
        streamingAvailable = available;
    }

    public boolean isStreamingAvailable() {
        return streamingAvailable;
    }

    public void setDownloadAvailable(boolean available) {
        downloadAvailable = available;
    }

    public boolean isDownloadAvailable() {
        return downloadAvailable;
    }

    public boolean addSubtitle(String languageCode) {
        if (languageCode == null || languageCode.trim().isEmpty()
                || subtitleCount >= subtitles.length) {
            return false;
        }
        String value = languageCode.trim();
        for (int i = 0; i < subtitleCount; i++) {
            if (subtitles[i].equalsIgnoreCase(value)) {
                return false;
            }
        }
        subtitles[subtitleCount++] = value;
        return true;
    }

    public boolean removeSubtitle(String languageCode) {
        if (languageCode == null) {
            return false;
        }
        for (int i = 0; i < subtitleCount; i++) {
            if (subtitles[i].equalsIgnoreCase(languageCode.trim())) {
                for (int j = i; j < subtitleCount - 1; j++) {
                    subtitles[j] = subtitles[j + 1];
                }
                subtitles[--subtitleCount] = null;
                return true;
            }
        }
        return false;
    }

    public String[] getSubtitles() {
        String[] result = new String[subtitleCount];
        System.arraycopy(subtitles, 0, result, 0, subtitleCount);
        return result;
    }

    public boolean addKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()
                || keywordCount >= keywords.length) {
            return false;
        }
        for (int i = 0; i < keywordCount; i++) {
            if (keywords[i].equalsIgnoreCase(keyword.trim())) {
                return false;
            }
        }
        keywords[keywordCount++] = keyword.trim();
        return true;
    }

    public boolean hasKeyword(String keyword) {
        if (keyword == null) {
            return false;
        }
        String normalizedKeyword = keyword.toLowerCase(java.util.Locale.ROOT);
        for (int i = 0; i < keywordCount; i++) {
            if (keywords[i].toLowerCase(java.util.Locale.ROOT).contains(normalizedKeyword)) {
                return true;
            }
        }
        return false;
    }

    public String[] getKeywords() {
        String[] result = new String[keywordCount];
        System.arraycopy(keywords, 0, result, 0, keywordCount);
        return result;
    }

    public boolean matchesAgeAndLanguage(int userAge, String preferredLanguage) {
        if (!canBeWatchedBy(userAge)) {
            return false;
        }
        return preferredLanguage == null
                || preferredLanguage.trim().isEmpty()
                || language.equalsIgnoreCase(preferredLanguage.trim());
    }

    public boolean canBeWatchedBy(int userAge) {
        return !parentalRestrictionActive() || userAge >= ageRating;
    }

    private boolean parentalRestrictionActive() {
        return ageRating > 0;
    }

    public void displayFullInfo() {
        displayInfo();
        System.out.println("Release year: " + releaseYear);
        System.out.println("Rating: " + rating + "/10");
        System.out.println("Age rating: " + ageRating + "+");
        System.out.println("Director: " + director);
        System.out.println("Language: " + language);
        System.out.println("Country: " + country);
        if (!description.isEmpty()) {
            System.out.println("Description: " + description);
        }
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl == null ? "" : posterUrl.trim();
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setMaturityRating(String maturityRating) {
        if (maturityRating != null && !maturityRating.trim().isEmpty()) {
            this.maturityRating = maturityRating.trim().toUpperCase();
        }
    }

    public String getMaturityRating() {
        return maturityRating;
    }

    public void setAudioFormat(String audioFormat) {
        if (audioFormat != null && !audioFormat.trim().isEmpty()) {
            this.audioFormat = audioFormat.trim();
        }
    }

    public String getAudioFormat() {
        return audioFormat;
    }

    public void setCaptionsAvailable(boolean available) {
        captionsAvailable = available;
    }

    public boolean areCaptionsAvailable() {
        return captionsAvailable;
    }

    public boolean addUserRating(double value) {
        if (!Double.isFinite(value) || value < 0.0 || value > 10.0) {
            return false;
        }
        userRatingCount++;
        userRatingTotal += value;
        rating = getCommunityRating();
        return true;
    }

    public double getCommunityRating() {
        return userRatingCount == 0 ? rating : userRatingTotal / userRatingCount;
    }

    public int getUserRatingCount() {
        return userRatingCount;
    }

    public void recordWatchSeconds(int seconds) {
        if (seconds > 0) {
            totalWatchSeconds = (int) Math.min(Integer.MAX_VALUE,
                    (long) totalWatchSeconds + seconds);
        }
        if (duration > 0 && (long) seconds >= (long) duration * 60L) {
            completionCount++;
            markWatched();
        }
    }

    public int getTotalWatchSeconds() {
        return totalWatchSeconds;
    }

    public int getCompletionCount() {
        return completionCount;
    }

    public double getCompletionRate() {
        if (viewCount == 0) {
            return 0.0;
        }
        return completionCount * 100.0 / viewCount;
    }

    public double getEngagementScore() {
        return viewCount * 1.0 + downloadCount * 2.0
                + likes * 1.5 + dislikes * -0.5 + completionCount * 3.0;
    }

    public boolean isTrending() {
        return viewCount >= 10 || getEngagementScore() >= 25.0;
    }

    public static Movies[] filterCatalog(String genre, int maximumAge,
                                          String language, int fromYear, int toYear) { return MovieCatalog.filterCatalog(genre, maximumAge, language, fromYear, toYear); }

    public static Movies[] getMostEngagedMovies(int limit) { return MovieCatalog.getMostEngagedMovies(limit); }
}
