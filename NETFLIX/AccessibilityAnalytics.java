import java.util.Locale;

public class AccessibilityAnalytics {
    public static int countMoviesWithSubtitles() {
        int count = 0;
        for (Movies movie : Movies.getAllMovies()) {
            if (movie.getSubtitles().length > 0) {
                count++;
            }
        }
        return count;
    }

    public static int countMoviesWithDescriptions() {
        int count = 0;
        for (Movies movie : Movies.getAllMovies()) {
            if (movie.getDescription() != null
                    && !movie.getDescription().trim().isEmpty()) {
                count++;
            }
        }
        return count;
    }

    public static double getSubtitleCoveragePercent() {
        if (Movies.getMovieCount() == 0) {
            return 0.0;
        }
        return ((double) countMoviesWithSubtitles() / Movies.getMovieCount()) * 100.0;
    }

    public static double getDescriptionCoveragePercent() {
        if (Movies.getMovieCount() == 0) {
            return 0.0;
        }
        return ((double) countMoviesWithDescriptions() / Movies.getMovieCount()) * 100.0;
    }

    public static String getSummary() {
        return "Subtitle coverage: "
                + String.format(Locale.ROOT, "%.1f", getSubtitleCoveragePercent())
                + "%, Description coverage: "
                + String.format("%.1f", getDescriptionCoveragePercent()) + "%";
    }
}
