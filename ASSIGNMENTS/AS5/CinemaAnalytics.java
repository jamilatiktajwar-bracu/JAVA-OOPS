public class CinemaAnalytics {
    public static double getCompletionRate(NETFLIX_USER user) {
        if (user == null || user.getWatchHistoryCount() == 0) {
            return 0.0;
        }
        int completed = 0;
        for (Movies movie : user.getWatchHistory()) {
            if (movie.isWatched()) {
                completed++;
            }
        }
        return ((double) completed / user.getWatchHistoryCount()) * 100.0;
    }

    public static int getFavouriteCount(NETFLIX_USER user) {
        return user == null ? 0 : user.getFavouriteMovies().length;
    }

    public static int getWatchListCount(NETFLIX_USER user) {
        return user == null ? 0 : user.getWatchListCount();
    }

    public static String getEngagementSummary(NETFLIX_USER user) {
        if (user == null) {
            return "No user";
        }
        return "Watched: " + user.getWatchHistoryCount()
                + ", Favorites: " + getFavouriteCount(user)
                + ", Watchlist: " + getWatchListCount(user)
                + ", Minutes: " + user.getTotalWatchedMinutes()
                + ", Completion: " + String.format("%.1f", getCompletionRate(user)) + "%";
    }

    public static Movies[] getPersonalTopRated(NETFLIX_USER user, int limit) {
        if (user == null || limit <= 0) {
            return new Movies[0];
        }
        Movies[] history = user.getWatchHistory();
        for (int i = 0; i < history.length - 1; i++) {
            for (int j = i + 1; j < history.length; j++) {
                if (history[i].getRating() < history[j].getRating()) {
                    Movies temporary = history[i];
                    history[i] = history[j];
                    history[j] = temporary;
                }
            }
        }
        int count = Math.min(limit, history.length);
        Movies[] result = new Movies[count];
        System.arraycopy(history, 0, result, 0, count);
        return result;
    }
}
