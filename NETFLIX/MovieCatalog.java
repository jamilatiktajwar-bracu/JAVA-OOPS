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
}
