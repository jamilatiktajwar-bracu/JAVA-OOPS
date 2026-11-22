public class LibraryAnalytics {
    public static int getGenreCount(String genre) {
        if (genre == null) {
            return 0;
        }
        return Movies.filterByGenre(genre).length;
    }

    public static double getWatchedPercent() {
        if (Movies.getMovieCount() == 0) {
            return 0.0;
        }
        return ((double) Movies.getWatchedCount() / Movies.getMovieCount()) * 100.0;
    }

    public static double getAverageDuration() {
        if (Movies.getMovieCount() == 0) {
            return 0.0;
        }
        return (double) Movies.getTotalDuration() / Movies.getMovieCount();
    }

    public static String getSummary() {
        String[] genres = Movies.getAvailableGenres();
        return "Movies: " + Movies.getMovieCount()
                + ", Genres: " + genres.length
                + ", Watched: " + Movies.getWatchedCount()
                + ", Average rating: " + Movies.getAverageRating();
    }

    public static Movies[] getAgeSafeLibrary(int maximumAge) {
        return Movies.filterByAgeRating(maximumAge);
    }
}
