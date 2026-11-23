public class RecommendationEngine {
    private NETFLIX_USER user;
    private String[] excludedGenres;
    private int excludedGenreCount;
    private Movies[] recentlyRecommended;
    private int recentRecommendationCount;
    private boolean diversityEnabled;
    private boolean freshOnly;
    private double ratingThreshold;
    private int minimumYear;
    private double popularityWeight;
    private double ratingWeight;
    private double genreWeight;
    private double recencyWeight;
    private boolean coldStartEnabled;
    private double personalizationStrength;

    public RecommendationEngine(NETFLIX_USER user) {
        this.user = user;
        this.excludedGenres = new String[20];
        this.excludedGenreCount = 0;
        this.recentlyRecommended = new Movies[100];
        this.recentRecommendationCount = 0;
        this.diversityEnabled = true;
        this.freshOnly = false;
        this.ratingThreshold = 0.0;
        this.minimumYear = 0;
        this.popularityWeight = 1.0;
        this.ratingWeight = 1.0;
        this.genreWeight = 1.0;
        this.recencyWeight = 1.0;
        this.coldStartEnabled = true;
        this.personalizationStrength = 1.0;
    }

    public Movies[] recommend(int limit) {
        if (user == null || limit <= 0) {
            return new Movies[0];
        }
        if (coldStartEnabled && isColdStartUser()) {
            Movies[] coldStart = getColdStartRecommendations(limit);
            Movies[] filtered = new Movies[coldStart.length];
            int filteredCount = 0;
            for (Movies movie : coldStart) {
                if (isCandidate(movie)) {
                    filtered[filteredCount++] = movie;
                }
            }
            Movies[] result = new Movies[filteredCount];
            System.arraycopy(filtered, 0, result, 0, filteredCount);
            rememberRecommendations(result);
            return result;
        }
        Movies[] all = Movies.getAllMovies();
        Movies[] result = new Movies[all.length];
        int count = 0;
        for (Movies movie : all) {
            if (isCandidate(movie)) {
                result[count++] = movie;
            }
        }
        sortByScore(result, count);
        if (diversityEnabled) {
            applyDiversity(result, count);
        }
        int size = Math.min(limit, count);
        Movies[] recommendations = new Movies[size];
        System.arraycopy(result, 0, recommendations, 0, size);
        rememberRecommendations(recommendations);
        return recommendations;
    }

    private boolean isCandidate(Movies movie) {
        if (movie == null || user.isFavourite(movie) || user.isInWatchHistory(movie)) {
            return false;
        }
        if (user.isParentalControlEnabled() && movie.getAgeRating() > user.getMaximumAgeRating()) {
            return false;
        }
        if (movie.getRating() < ratingThreshold || movie.getReleaseYear() < minimumYear) {
            return false;
        }
        if (isExcludedGenre(movie.getGenre()) || wasRecentlyRecommended(movie)) {
            return false;
        }
        if (freshOnly && movie.isWatched()) {
            return false;
        }
        return true;
    }

    private double getScore(Movies movie) {
        double score = movie.getRating() * 10.0 * ratingWeight;
        score += movie.getLikeScore() * 1.0;
        score += movie.getViewCount() * popularityWeight;
        if (movie.getGenre().equalsIgnoreCase(user.getFavouriteGenre())) {
            score += 100.0 * genreWeight * personalizationStrength;
        }
        if (movie.getLanguage().equalsIgnoreCase(user.getPreferredLanguage())) {
            score += 50.0 * personalizationStrength;
        }
        if (movie.isFeatured()) {
            score += 25.0;
        }
        int recencyBoost = Math.max(0, movie.getReleaseYear() - 2000);
        score += recencyBoost * 0.1 * recencyWeight;
        for (Movies favourite : user.getFavouriteMovies()) {
            if (favourite.getDirector().equalsIgnoreCase(movie.getDirector())) {
                score += 40.0 * personalizationStrength;
            }
        }
        return score;
    }

    private void sortByScore(Movies[] items, int count) {
        for (int i = 0; i < count - 1; i++) {
            for (int j = i + 1; j < count; j++) {
                double firstScore = getScore(items[i]);
                double secondScore = getScore(items[j]);
                if (firstScore < secondScore
                        || (firstScore == secondScore
                        && items[i].getTitle().compareToIgnoreCase(items[j].getTitle()) > 0)) {
                    Movies temporary = items[i];
                    items[i] = items[j];
                    items[j] = temporary;
                }
            }
        }
    }

    public Movies[] getGenreRecommendations(String genre, int limit) {
        if (genre == null || limit <= 0) {
            return new Movies[0];
        }
        Movies[] matches = Movies.filterByGenre(genre.trim());
        Movies[] result = new Movies[matches.length];
        int count = 0;
        for (Movies movie : matches) {
            if (isCandidate(movie)) {
                result[count++] = movie;
            }
        }
        sortByScore(result, count);
        int size = Math.min(limit, count);
        Movies[] recommendations = new Movies[size];
        System.arraycopy(result, 0, recommendations, 0, size);
        return recommendations;
    }

    public boolean excludeGenre(String genre) {
        if (genre == null || genre.trim().isEmpty()
                || isExcludedGenre(genre.trim())
                || excludedGenreCount >= excludedGenres.length) {
            return false;
        }
        excludedGenres[excludedGenreCount++] = genre.trim();
        return true;
    }

    public boolean removeExcludedGenre(String genre) {
        if (genre == null) {
            return false;
        }
        for (int i = 0; i < excludedGenreCount; i++) {
            if (excludedGenres[i].equalsIgnoreCase(genre.trim())) {
                for (int j = i; j < excludedGenreCount - 1; j++) {
                    excludedGenres[j] = excludedGenres[j + 1];
                }
                excludedGenres[--excludedGenreCount] = null;
                return true;
            }
        }
        return false;
    }

    private boolean isExcludedGenre(String genre) {
        for (int i = 0; i < excludedGenreCount; i++) {
            if (excludedGenres[i].equalsIgnoreCase(genre)) {
                return true;
            }
        }
        return false;
    }

    public void setDiversityEnabled(boolean enabled) {
        diversityEnabled = enabled;
    }

    public boolean isDiversityEnabled() {
        return diversityEnabled;
    }

    public void setFreshOnly(boolean freshOnly) {
        this.freshOnly = freshOnly;
    }

    public boolean isFreshOnly() {
        return freshOnly;
    }

    public boolean setRatingThreshold(double threshold) {
        if (Double.isNaN(threshold) || Double.isInfinite(threshold)
                || threshold < 0.0 || threshold > 10.0) {
            return false;
        }
        ratingThreshold = threshold;
        return true;
    }

    public double getRatingThreshold() {
        return ratingThreshold;
    }

    public void setMinimumYear(int year) {
        minimumYear = year;
    }

    public int getMinimumYear() {
        return minimumYear;
    }

    private void applyDiversity(Movies[] result, int count) {
        if (count < 3) {
            return;
        }
        for (int i = 1; i < count - 1; i++) {
            if (result[i].getGenre().equalsIgnoreCase(result[i - 1].getGenre())) {
                for (int j = i + 1; j < count; j++) {
                    if (!result[j].getGenre().equalsIgnoreCase(result[i - 1].getGenre())) {
                        Movies temporary = result[i];
                        result[i] = result[j];
                        result[j] = temporary;
                        break;
                    }
                }
            }
        }
    }

    private void rememberRecommendations(Movies[] recommendations) {
        for (Movies movie : recommendations) {
            if (recentRecommendationCount < recentlyRecommended.length) {
                recentlyRecommended[recentRecommendationCount++] = movie;
            }
        }
    }

    private boolean wasRecentlyRecommended(Movies movie) {
        for (int i = 0; i < recentRecommendationCount; i++) {
            if (recentlyRecommended[i] == movie) {
                return true;
            }
        }
        return false;
    }

    public void clearRecommendationHistory() {
        for (int i = 0; i < recentRecommendationCount; i++) {
            recentlyRecommended[i] = null;
        }
        recentRecommendationCount = 0;
    }

    public String explainRecommendation(Movies movie) {
        if (movie == null || user == null) {
            return "No movie or user context";
        }
        if (movie.getGenre().equalsIgnoreCase(user.getFavouriteGenre())) {
            return "Matches your favourite genre: " + movie.getGenre();
        }
        if (movie.getLanguage().equalsIgnoreCase(user.getPreferredLanguage())) {
            return "Matches your preferred language";
        }
        if (movie.getRating() >= ratingThreshold && ratingThreshold > 0) {
            return "High rating: " + movie.getRating() + "/10";
        }
        if (movie.isFeatured()) {
            return "Featured by the platform";
        }
        return "Popular in your catalog";
    }

    public Movies[] getSurpriseRecommendations(int limit) {
        if (user == null || limit <= 0) {
            return new Movies[0];
        }
        Movies[] all = Movies.getAllMovies();
        Movies[] result = new Movies[all.length];
        int count = 0;
        for (Movies movie : all) {
            if (isCandidate(movie)
                    && !movie.getGenre().equalsIgnoreCase(user.getFavouriteGenre())) {
                result[count++] = movie;
            }
        }
        // Fisher-Yates shuffle guarantees unique picks from the candidate pool.
        for (int i = count - 1; i > 0; i--) {
            int j = (int) (Math.random() * (i + 1));
            Movies temporary = result[i];
            result[i] = result[j];
            result[j] = temporary;
        }
        int size = Math.min(limit, count);
        Movies[] surprise = new Movies[size];
        System.arraycopy(result, 0, surprise, 0, size);
        rememberRecommendations(surprise);
        return surprise;
    }

    public boolean setPopularityWeight(double weight) {
        if (Double.isNaN(weight) || Double.isInfinite(weight)
                || weight < 0.0 || weight > 5.0) {
            return false;
        }
        popularityWeight = weight;
        return true;
    }

    public boolean setRatingWeight(double weight) {
        if (Double.isNaN(weight) || Double.isInfinite(weight)
                || weight < 0.0 || weight > 5.0) {
            return false;
        }
        ratingWeight = weight;
        return true;
    }

    public boolean setGenreWeight(double weight) {
        if (Double.isNaN(weight) || Double.isInfinite(weight)
                || weight < 0.0 || weight > 5.0) {
            return false;
        }
        genreWeight = weight;
        return true;
    }

    public boolean setRecencyWeight(double weight) {
        if (Double.isNaN(weight) || Double.isInfinite(weight)
                || weight < 0.0 || weight > 5.0) {
            return false;
        }
        recencyWeight = weight;
        return true;
    }

    public boolean setPersonalizationStrength(double strength) {
        if (Double.isNaN(strength) || Double.isInfinite(strength)
                || strength < 0.0 || strength > 2.0) {
            return false;
        }
        personalizationStrength = strength;
        return true;
    }

    public void setColdStartEnabled(boolean enabled) {
        coldStartEnabled = enabled;
    }

    public boolean isColdStartEnabled() {
        return coldStartEnabled;
    }

    public boolean isColdStartUser() {
        return user != null && user.getWatchHistoryCount() == 0
                && user.getFavouriteMovies().length == 0;
    }

    public Movies[] getColdStartRecommendations(int limit) {
        if (!coldStartEnabled || user == null || limit <= 0) {
            return new Movies[0];
        }
        Movies[] all = Movies.getAllMovies();
        Movies[] candidates = new Movies[all.length];
        int count = 0;
        for (Movies movie : all) {
            if (isCandidate(movie)) {
                candidates[count++] = movie;
            }
        }
        // Cold-start candidates are ranked by rating, then title for deterministic ties.
        for (int i = 0; i < count - 1; i++) {
            for (int j = i + 1; j < count; j++) {
                if (candidates[i].getRating() < candidates[j].getRating()
                        || (candidates[i].getRating() == candidates[j].getRating()
                        && candidates[i].getTitle().compareToIgnoreCase(candidates[j].getTitle()) > 0)) {
                    Movies temporary = candidates[i];
                    candidates[i] = candidates[j];
                    candidates[j] = temporary;
                }
            }
        }
        Movies[] ranked = new Movies[count];
        System.arraycopy(candidates, 0, ranked, 0, count);
        return ranked;
    }

    public double calculateSimilarity(NETFLIX_USER other) {
        if (other == null) {
            return 0.0;
        }
        if (user == null) {
            return 0.0;
        }
        Movies[] thisMovies = user.getFavouriteMovies();
        Movies[] otherMovies = other.getFavouriteMovies();
        if (thisMovies.length == 0 || otherMovies.length == 0) {
            return 0.0;
        }
        int matches = 0;
        for (Movies first : thisMovies) {
            for (Movies second : otherMovies) {
                if (first == second) {
                    matches++;
                }
            }
        }
        int union = thisMovies.length + otherMovies.length - matches;
        return union == 0 ? 0.0 : (double) matches / union;
    }

    public Movies[] getCollaborativeRecommendations(NETFLIX_USER similarUser, int limit) {
        if (similarUser == null || limit <= 0) {
            return new Movies[0];
        }
        Movies[] favourites = similarUser.getFavouriteMovies();
        Movies[] result = new Movies[favourites.length];
        int count = 0;
        for (Movies movie : favourites) {
            if (isCandidate(movie)) {
                result[count++] = movie;
            }
        }
        sortByScore(result, count);
        int size = Math.min(limit, count);
        Movies[] recommendations = new Movies[size];
        System.arraycopy(result, 0, recommendations, 0, size);
        rememberRecommendations(recommendations);
        return recommendations;
    }

    public Movies[] getSessionAwareRecommendations(int limit) {
        if (user == null || limit <= 0) {
            return new Movies[0];
        }
        Movies[] recent = user.getRecentlyWatched(Math.min(5, limit));
        if (recent.length == 0) {
            return recommend(limit);
        }
        Movies[] all = Movies.getAllMovies();
        Movies[] result = new Movies[all.length];
        int count = 0;
        for (Movies movie : all) {
            if (isCandidate(movie)
                    && movie.getGenre().equalsIgnoreCase(recent[0].getGenre())) {
                result[count++] = movie;
            }
        }
        sortByScore(result, count);
        int size = Math.min(limit, count);
        Movies[] recommendations = new Movies[size];
        System.arraycopy(result, 0, recommendations, 0, size);
        rememberRecommendations(recommendations);
        return recommendations;
    }

    public String getEngineHealth() {
        if (user == null) {
            return "Critical: No user";
        }
        if (isColdStartUser()) {
            return "Healthy: Cold start mode";
        }
        if (recentRecommendationCount == 0) {
            return "Healthy: Ready";
        }
        return "Healthy: Active personalization";
    }
}
