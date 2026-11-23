public class LibraryAnalytics {
    public static double getHighestRatedValue() {
        Movies highest = Movies.getHighestRatedMovie();
        return highest == null ? 0.0 : highest.getRating();
    }

    public static int getFeaturedCount() {
        return Movies.getFeaturedMovies().length;
    }

    public static int getUpcomingCount() {
        return Movies.getUpcomingMovies().length;
    }

    public static int getStreamingCount() {
        return Movies.getAvailableForStreaming().length;
    }

    public static double getDownloadablePercent() {
        if (Movies.getMovieCount() == 0) {
            return 0.0;
        }
        int count = 0;
        for (Movies movie : Movies.getAllMovies()) {
            if (movie.isDownloadAvailable()) {
                count++;
            }
        }
        return ((double) count / Movies.getMovieCount()) * 100.0;
    }

    public static int getGenreCountDistinct() {
        return Movies.getAvailableGenres().length;
    }

    public static int getTotalCastSize() {
        int total = 0;
        for (Movies movie : Movies.getAllMovies()) {
            total += movie.getCastCount();
        }
        return total;
    }

    public static String getTopDirector() {
        Movies[] movies = Movies.getAllMovies();
        if (movies.length == 0) {
            return "Not available";
        }
        String top = movies[0].getDirector();
        int highest = 0;
        for (Movies movie : movies) {
            int count = 0;
            for (Movies other : movies) {
                if (other.getDirector().equalsIgnoreCase(movie.getDirector())) {
                    count++;
                }
            }
            if (count > highest) {
                highest = count;
                top = movie.getDirector();
            }
        }
        return top;
    }

    public static String getExtendedSummary() {
        return getSummary()
                + ", Featured: " + getFeaturedCount()
                + ", Streaming: " + getStreamingCount()
                + ", Upcoming: " + getUpcomingCount()
                + ", Top director: " + getTopDirector();
    }
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
