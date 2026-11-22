public class ContentHealthReport {
    public static int countMissingDescriptions() {
        int count = 0;
        for (Movies movie : Movies.getAllMovies()) {
            if (movie.getDescription() == null || movie.getDescription().isEmpty()) {
                count++;
            }
        }
        return count;
    }

    public static int countMissingTrailers() {
        int count = 0;
        for (Movies movie : Movies.getAllMovies()) {
            if (movie.getTrailerUrl() == null || movie.getTrailerUrl().isEmpty()) {
                count++;
            }
        }
        return count;
    }

    public static int countMissingAgeRatings() {
        int count = 0;
        for (Movies movie : Movies.getAllMovies()) {
            if (movie.getAgeRating() == 0) {
                count++;
            }
        }
        return count;
    }

    public static int countMissingCast() {
        int count = 0;
        for (Movies movie : Movies.getAllMovies()) {
            if (movie.getCastCount() == 0) {
                count++;
            }
        }
        return count;
    }

    public static int countMissingSubtitles() {
        int count = 0;
        for (Movies movie : Movies.getAllMovies()) {
            if (movie.getSubtitles().length == 0) {
                count++;
            }
        }
        return count;
    }

    public static String getHealthGrade() {
        int missing = countMissingDescriptions()
                + countMissingTrailers()
                + countMissingAgeRatings()
                + countMissingCast()
                + countMissingSubtitles();
        if (Movies.getMovieCount() == 0) {
            return "N/A";
        }
        if (missing == 0) {
            return "A";
        }
        if (missing <= 3) {
            return "B";
        }
        if (missing <= 7) {
            return "C";
        }
        return "D";
    }

    public static String getSummary() {
        return "Grade: " + getHealthGrade()
                + ", Missing descriptions: " + countMissingDescriptions()
                + ", Missing trailers: " + countMissingTrailers()
                + ", Missing age ratings: " + countMissingAgeRatings()
                + ", Missing cast: " + countMissingCast()
                + ", Missing subtitles: " + countMissingSubtitles();
    }
}
