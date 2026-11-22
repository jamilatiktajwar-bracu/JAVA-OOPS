public class RecommendationEngine {
    private NETFLIX_USER user;

    public RecommendationEngine(NETFLIX_USER user) {
        this.user = user;
    }

    public Movies[] recommend(int limit) {
        if (user == null || limit <= 0) {
            return new Movies[0];
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
        int size = Math.min(limit, count);
        Movies[] recommendations = new Movies[size];
        System.arraycopy(result, 0, recommendations, 0, size);
        return recommendations;
    }

    private boolean isCandidate(Movies movie) {
        if (movie == null || user.isFavourite(movie) || user.isInWatchHistory(movie)) {
            return false;
        }
        if (user.isParentalControlEnabled() && movie.getAgeRating() > user.getMaximumAgeRating()) {
            return false;
        }
        return true;
    }

    private int getScore(Movies movie) {
        int score = (int) (movie.getRating() * 10);
        score += movie.getLikeScore();
        score += movie.getViewCount();
        if (movie.getGenre().equalsIgnoreCase(user.getFavouriteGenre())) {
            score += 100;
        }
        if (movie.getLanguage().equalsIgnoreCase(user.getPreferredLanguage())) {
            score += 50;
        }
        return score;
    }

    private void sortByScore(Movies[] items, int count) {
        for (int i = 0; i < count - 1; i++) {
            for (int j = i + 1; j < count; j++) {
                if (getScore(items[i]) < getScore(items[j])) {
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
        Movies[] matches = Movies.filterByGenre(genre);
        Movies[] result = new Movies[matches.length];
        int count = 0;
        for (Movies movie : matches) {
            if (isCandidate(movie)) {
                result[count++] = movie;
            }
        }
        int size = Math.min(limit, count);
        Movies[] recommendations = new Movies[size];
        System.arraycopy(result, 0, recommendations, 0, size);
        return recommendations;
    }
}
