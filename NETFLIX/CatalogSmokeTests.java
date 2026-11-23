final class CatalogSmokeTests {
    static void run() {
        testLocaleIndependentMovieSearch();
        testMovieCatalogServiceAndStatisticsBoundaries();
        testMovieConstructorNormalization();
        testMovieMetadataArrayHandling();
    }

private static void testLocaleIndependentMovieSearch() {
        SmokeTestSupport.require(Movies.addMovie("INDIGO", "Drama", 90), "test movie should be added");
        Movies testMovie = Movies.getMovie(Movies.getMovieCount() - 1);
        SmokeTestSupport.require(testMovie.addKeyword("INDIGO"), "keyword should be added");
        SmokeTestSupport.require(!testMovie.setRating(Double.NaN), "NaN movie rating should be rejected");
        SmokeTestSupport.require(!testMovie.setRating(Double.POSITIVE_INFINITY), "infinite movie rating should be rejected");
        SmokeTestSupport.require(testMovie.setRating(8.5), "finite rating within range should be accepted");
        java.util.Locale original = java.util.Locale.getDefault();
        try {
            java.util.Locale.setDefault(new java.util.Locale("tr", "TR"));
            SmokeTestSupport.require(Movies.searchByTitle("indigo").length == 1,
                    "title search should not depend on Turkish casing rules");
            SmokeTestSupport.require(Movies.search("indigo").length == 1,
                    "general search should not depend on Turkish casing rules");
            SmokeTestSupport.require(testMovie.hasKeyword("indigo"),
                    "keyword matching should not depend on Turkish casing rules");
        } finally {
            java.util.Locale.setDefault(original);
            Movies.removeMovie("INDIGO");
        }
    }

private static void testMovieCatalogServiceAndStatisticsBoundaries() {
        Movies.clearMovies();
        Movies movie = MovieCatalog.addMovie("Catalog entry", "Drama", 120);
        SmokeTestSupport.require(movie != null, "catalog service should add valid movies");
        SmokeTestSupport.require(MovieCatalog.size() == 1, "catalog service should expose its count");
        SmokeTestSupport.require(MovieCatalog.get(0) == movie, "catalog lookup should return the added movie");
        SmokeTestSupport.require(MovieCatalog.addMovie("catalog ENTRY", "Drama", 90) == null,
                "catalog should reject duplicate titles case-insensitively");
        SmokeTestSupport.require(!MovieCatalog.removeMovie(-1), "catalog should reject invalid indices");
        SmokeTestSupport.require(MovieCatalog.removeMovie("Catalog entry"), "catalog should remove by title");
        SmokeTestSupport.require(MovieCatalog.size() == 0, "catalog count should update after removal");

        Movies stats = new Movies("Statistics boundary", "Drama", 1);
        SmokeTestSupport.require(!stats.addUserRating(Double.NaN), "NaN user ratings should be rejected");
        SmokeTestSupport.require(!stats.addUserRating(Double.POSITIVE_INFINITY), "infinite user ratings should be rejected");
        stats.recordWatchSeconds(Integer.MAX_VALUE);
        stats.recordWatchSeconds(Integer.MAX_VALUE);
        SmokeTestSupport.require(stats.getTotalWatchSeconds() == Integer.MAX_VALUE,
                "watch time should saturate instead of overflowing");
        SmokeTestSupport.require(stats.getCompletionCount() == 2,
                "valid full-duration watch records should increment completion count");
        Movies.clearMovies();
    }

private static void testMovieConstructorNormalization() {
        Movies invalid = new Movies("  ", null, -10, 1800);
        SmokeTestSupport.require("Untitled".equals(invalid.getTitle()), "blank constructor title should normalize");
        SmokeTestSupport.require("Unknown".equals(invalid.getGenre()), "null constructor genre should normalize");
        SmokeTestSupport.require(invalid.getDuration() == 0, "invalid constructor duration should normalize to zero");
        SmokeTestSupport.require(invalid.getReleaseYear() == 0, "invalid constructor release year should remain unset");
        Movies valid = new Movies("  Film  ", "  Drama  ", 120, 2020);
        SmokeTestSupport.require("Film".equals(valid.getTitle()) && "Drama".equals(valid.getGenre()), "constructor should trim valid text");
        SmokeTestSupport.require(valid.getDuration() == 120 && valid.getReleaseYear() == 2020, "valid constructor values should be retained");
    }

private static void testMovieMetadataArrayHandling() {
        Movies movie = new Movies("Array test", "Drama", 90);
        SmokeTestSupport.require(movie.addCastMember("Actor"), "first cast entry should be accepted");
        SmokeTestSupport.require(!movie.addCastMember(" actor "), "duplicate cast entry should be rejected case-insensitively");
        SmokeTestSupport.require(movie.addSubtitle("en"), "first subtitle should be accepted");
        SmokeTestSupport.require(!movie.addSubtitle(" EN "), "duplicate subtitle should be rejected case-insensitively");
        String[] cast = movie.getCast();
        cast[0] = "Mutated";
        SmokeTestSupport.require("Actor".equals(movie.getCast()[0]), "cast getter should return a defensive array copy");
    }
}
