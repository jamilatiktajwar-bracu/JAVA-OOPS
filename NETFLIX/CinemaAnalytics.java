import java.util.Locale;

public class CinemaAnalytics {
    public static double getAveragePersonalRating(NETFLIX_USER user) {
        if (user == null) {
            return 0.0;
        }
        Movies[] history = user.getWatchHistory();
        if (history.length == 0) {
            return 0.0;
        }
        double total = 0.0;
        for (Movies movie : history) {
            total += movie.getRating();
        }
        return total / history.length;
    }

    public static int getLongestWatchedSession(NETFLIX_USER user) {
        if (user == null) {
            return 0;
        }
        int longest = 0;
        for (Movies movie : user.getWatchHistory()) {
            if (movie.getDuration() > longest) {
                longest = movie.getDuration();
            }
        }
        return longest;
    }

    public static String getMostWatchedGenre(NETFLIX_USER user) {
        if (user == null) {
            return "Not available";
        }
        Movies[] history = user.getWatchHistory();
        if (history.length == 0) {
            return "Not available";
        }
        String favourite = history[0].getGenre();
        int highest = 0;
        for (Movies movie : history) {
            int count = 0;
            for (Movies other : history) {
                if (other.getGenre().equalsIgnoreCase(movie.getGenre())) {
                    count++;
                }
            }
            if (count > highest) {
                highest = count;
                favourite = movie.getGenre();
            }
        }
        return favourite;
    }

    public static double getAverageSessionMinutes(NETFLIX_USER user) {
        if (user == null) {
            return 0.0;
        }
        Movies[] history = user.getWatchHistory();
        if (history.length == 0) {
            return 0.0;
        }
        return (double) user.getTotalWatchedMinutes() / history.length;
    }

    public static int getRewatchCount(NETFLIX_USER user) {
        if (user == null) {
            return 0;
        }
        Movies[] history = user.getWatchHistory();
        int count = 0;
        for (int i = 0; i < history.length; i++) {
            for (int j = i + 1; j < history.length; j++) {
                if (history[i] == history[j]) {
                    count++;
                    break;
                }
            }
        }
        return count;
    }

    public static String getEngagementLevel(NETFLIX_USER user) {
        int minutes = user == null ? 0 : user.getTotalWatchedMinutes();
        if (minutes >= 500) {
            return "Very High";
        }
        if (minutes >= 250) {
            return "High";
        }
        if (minutes >= 100) {
            return "Medium";
        }
        return "Low";
    }

    public static double getFavouriteRatio(NETFLIX_USER user) {
        if (user == null || user.getWatchHistoryCount() == 0) {
            return 0.0;
        }
        Movies[] history = user.getWatchHistory();
        int favouritesInHistory = 0;
        for (Movies movie : history) {
            if (user.isFavourite(movie)) {
                favouritesInHistory++;
            }
        }
        return ((double) favouritesInHistory / history.length) * 100.0;
    }

    public static String getAnalyticsSummary(NETFLIX_USER user) {
        return getEngagementSummary(user)
                + ", Average rating: " + String.format(Locale.ROOT, "%.1f",
                        getAveragePersonalRating(user))
                + ", Top genre: " + getMostWatchedGenre(user)
                + ", Level: " + getEngagementLevel(user);
    }
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
