/**
 * Owns the in-memory movie catalog and its basic lifecycle operations.
 *
 * Legacy static catalog methods on {@link Movies} delegate here to preserve
 * compatibility with the original OOP assignment API.
 */
public final class MovieCatalog {
    static final int DEFAULT_CAPACITY = 100;
    static final Movies[] movies = new Movies[DEFAULT_CAPACITY];
    static int count;

    private MovieCatalog() {
        // Utility/service class.
    }

    public static Movies addMovie(String title, String genre, int duration) {
        if (title == null || genre == null || title.trim().isEmpty()
                || genre.trim().isEmpty() || duration < 0 || duration > 1440
                || count >= movies.length) {
            return null;
        }

        String normalizedTitle = title.trim();
        for (int i = 0; i < count; i++) {
            if (movies[i].getTitle().equalsIgnoreCase(normalizedTitle)) {
                return null;
            }
        }

        Movies movie = new Movies(normalizedTitle, genre.trim(), duration);
        movies[count++] = movie;
        return movie;
    }

    public static boolean removeMovie(int index) {
        if (index < 0 || index >= count) {
            return false;
        }
        for (int i = index; i < count - 1; i++) {
            movies[i] = movies[i + 1];
        }
        movies[--count] = null;
        return true;
    }

    public static boolean removeMovie(String title) {
        if (title == null || title.trim().isEmpty()) {
            return false;
        }
        String normalized = title.trim();
        for (int i = 0; i < count; i++) {
            if (movies[i].getTitle().equalsIgnoreCase(normalized)) {
                return removeMovie(i);
            }
        }
        return false;
    }

    public static Movies[] getAll() {
        Movies[] result = new Movies[count];
        System.arraycopy(movies, 0, result, 0, count);
        return result;
    }

    public static Movies get(int index) {
        if (index < 0 || index >= count) {
            throw new IndexOutOfBoundsException("Invalid movie index: " + index);
        }
        return movies[index];
    }

    public static int size() {
        return count;
    }

    public static void clear() {
        for (int i = 0; i < count; i++) {
            movies[i] = null;
        }
        count = 0;
    }


public static Movies[] searchByTitle(String keyword) {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        if (keyword == null) {
            return new Movies[0];
        }
        String search = keyword.trim().toLowerCase(java.util.Locale.ROOT);
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].getTitle().toLowerCase(java.util.Locale.ROOT).contains(search)) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] filterByGenre(String genre) {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        if (genre == null) {
            return new Movies[0];
        }
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].getGenre().equalsIgnoreCase(genre.trim())) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] getAllMovies() {
        return copyMovies(MovieCatalog.movies, MovieCatalog.count);
    }

public static Movies[] getWatchedMovies() {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].isWatched()) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] getUnwatchedMovies() {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (!MovieCatalog.movies[i].isWatched()) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] filterByReleaseYear(int fromYear, int toYear) {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            int year = MovieCatalog.movies[i].getReleaseYear();
            if (year >= fromYear && year <= toYear) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] filterByAgeRating(int maximumAge) {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].getAgeRating() <= maximumAge) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] filterByLanguage(String language) {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        if (language == null) {
            return new Movies[0];
        }
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].getLanguage().equalsIgnoreCase(language.trim())) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] getFeaturedMovies() {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].isFeatured()) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] getTopRatedMovies(int limit) {
        if (limit <= 0 || MovieCatalog.count == 0) {
            return new Movies[0];
        }
        Movies[] ranked = sortByRating(true);
        int count = Math.min(limit, ranked.length);
        Movies[] result = new Movies[count];
        System.arraycopy(ranked, 0, result, 0, count);
        return result;
    }

public static String[] getAvailableGenres() {
        String[] genres = new String[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            boolean exists = false;
            for (int j = 0; j < count; j++) {
                if (genres[j].equalsIgnoreCase(MovieCatalog.movies[i].getGenre())) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                genres[count++] = MovieCatalog.movies[i].getGenre();
            }
        }
        String[] result = new String[count];
        System.arraycopy(genres, 0, result, 0, count);
        return result;
    }

public static Movies[] search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new Movies[0];
        }
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        String search = keyword.trim().toLowerCase(java.util.Locale.ROOT);
        for (int i = 0; i < MovieCatalog.count; i++) {
            Movies movie = MovieCatalog.movies[i];
            if (movie.getTitle().toLowerCase(java.util.Locale.ROOT).contains(search)
                    || movie.getGenre().toLowerCase(java.util.Locale.ROOT).contains(search)
                    || movie.getDirector().toLowerCase(java.util.Locale.ROOT).contains(search)
                    || movie.getDescription().toLowerCase(java.util.Locale.ROOT).contains(search)
                    || movie.hasKeyword(search)) {
                matches[count++] = movie;
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] getAvailableForStreaming() {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].isStreamingAvailable()) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] getTrendingMovies(int limit) {
        if (limit <= 0 || MovieCatalog.count == 0) {
            return new Movies[0];
        }
        Movies[] result = getAllMovies();
        for (int i = 0; i < result.length - 1; i++) {
            for (int j = i + 1; j < result.length; j++) {
                if (result[i].getViewCount() < result[j].getViewCount()) {
                    Movies temporary = result[i];
                    result[i] = result[j];
                    result[j] = temporary;
                }
            }
        }
        int count = Math.min(limit, result.length);
        Movies[] trending = new Movies[count];
        System.arraycopy(result, 0, trending, 0, count);
        return trending;
    }

public static Movies[] getNewReleases(int fromYear) {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].getReleaseYear() >= fromYear) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] getUpcomingMovies() {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            if (MovieCatalog.movies[i].getReleaseStatus().equalsIgnoreCase("Upcoming")) {
                matches[count++] = MovieCatalog.movies[i];
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] sortByTitle(boolean ascending) {
        Movies[] result = getAllMovies();
        for (int i = 0; i < result.length - 1; i++) {
            for (int j = i + 1; j < result.length; j++) {
                int comparison = result[i].getTitle().compareToIgnoreCase(result[j].getTitle());
                if ((ascending && comparison > 0) || (!ascending && comparison < 0)) {
                    Movies temporary = result[i];
                    result[i] = result[j];
                    result[j] = temporary;
                }
            }
        }
        return result;
    }

public static Movies[] sortByRating(boolean descending) {
        Movies[] result = getAllMovies();
        for (int i = 0; i < result.length - 1; i++) {
            for (int j = i + 1; j < result.length; j++) {
                if ((descending && result[i].getRating() < result[j].getRating())
                        || (!descending && result[i].getRating() > result[j].getRating())) {
                    Movies temporary = result[i];
                    result[i] = result[j];
                    result[j] = temporary;
                }
            }
        }
        return result;
    }

public static Movies[] sortByReleaseYear(boolean descending) {
        Movies[] result = getAllMovies();
        for (int i = 0; i < result.length - 1; i++) {
            for (int j = i + 1; j < result.length; j++) {
                if ((descending && result[i].getReleaseYear() < result[j].getReleaseYear())
                        || (!descending && result[i].getReleaseYear() > result[j].getReleaseYear())) {
                    Movies temporary = result[i];
                    result[i] = result[j];
                    result[j] = temporary;
                }
            }
        }
        return result;
    }

public static Movies[] filterCatalog(String genre, int maximumAge,
                                          String language, int fromYear, int toYear) {
        Movies[] matches = new Movies[MovieCatalog.count];
        int count = 0;
        for (int i = 0; i < MovieCatalog.count; i++) {
            Movies movie = MovieCatalog.movies[i];
            boolean genreMatches = genre == null || genre.trim().isEmpty()
                    || movie.getGenre().equalsIgnoreCase(genre.trim());
            boolean languageMatches = language == null || language.trim().isEmpty()
                    || movie.getLanguage().equalsIgnoreCase(language.trim());
            boolean yearMatches = movie.getReleaseYear() >= fromYear
                    && movie.getReleaseYear() <= toYear;
            if (genreMatches && movie.canBeWatchedBy(maximumAge)
                    && languageMatches && yearMatches) {
                matches[count++] = movie;
            }
        }
        return copyMovies(matches, count);
    }

public static Movies[] getMostEngagedMovies(int limit) {
        if (limit <= 0) {
            return new Movies[0];
        }
        Movies[] result = getAllMovies();
        for (int i = 0; i < result.length - 1; i++) {
            for (int j = i + 1; j < result.length; j++) {
                if (result[i].getEngagementScore() < result[j].getEngagementScore()) {
                    Movies temporary = result[i];
                    result[i] = result[j];
                    result[j] = temporary;
                }
            }
        }
        int count = Math.min(limit, result.length);
        Movies[] mostEngaged = new Movies[count];
        System.arraycopy(result, 0, mostEngaged, 0, count);
        return mostEngaged;
    }

private static Movies[] copyMovies(Movies[] source, int count) {
        Movies[] result = new Movies[count];
        System.arraycopy(source, 0, result, 0, count);
        return result;
    }
}
