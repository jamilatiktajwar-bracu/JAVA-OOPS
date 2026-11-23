final class CatalogSmokeTests {
    static void run() {
        testLocaleIndependentMovieSearch();
        testMovieCatalogServiceAndStatisticsBoundaries();
        testMovieConstructorNormalization();
        testMovieMetadataArrayHandling();
        testCatalogQueryMigration();
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
    private static void testCatalogQueryMigration() {
        Movies.clearMovies();
        Movies alpha = MovieCatalog.addMovie("Alpha", "Drama", 100);
        Movies beta = MovieCatalog.addMovie("Beta Space", "Sci-Fi", 120);
        Movies gamma = MovieCatalog.addMovie("Gamma", "Drama", 80);
        alpha.setReleaseYear(2020);
        beta.setReleaseYear(2024);
        gamma.setReleaseYear(2018);
        alpha.setRating(7.0);
        beta.setRating(9.0);
        gamma.setRating(8.0);
        alpha.setAgeRating(10);
        beta.setAgeRating(16);
        gamma.setAgeRating(12);
        alpha.setLanguage("Bangla");
        beta.setLanguage("English");
        gamma.setLanguage("Bangla");
        alpha.markWatched();
        beta.setFeatured(true);
        beta.addKeyword("space");
        gamma.setReleaseStatus("Upcoming");
        gamma.setStreamingAvailable(false);

        SmokeTestSupport.require(MovieCatalog.searchByTitle("space").length == 1,
                "catalog title search should find matching title");
        SmokeTestSupport.require(MovieCatalog.search("space").length == 1,
                "catalog general search should match keywords");
        SmokeTestSupport.require(MovieCatalog.filterByGenre("drama").length == 2,
                "genre filter should be case-insensitive");
        SmokeTestSupport.require(MovieCatalog.filterByReleaseYear(2019, 2024).length == 2,
                "year filter should use inclusive boundaries");
        SmokeTestSupport.require(MovieCatalog.filterByAgeRating(12).length == 2,
                "age filter should respect maximum age");
        SmokeTestSupport.require(MovieCatalog.filterByLanguage("bangla").length == 2,
                "language filter should be case-insensitive");
        SmokeTestSupport.require(MovieCatalog.getWatchedMovies().length == 1
                && MovieCatalog.getUnwatchedMovies().length == 2,
                "watched/unwatched catalog filters should partition movies");
        SmokeTestSupport.require(MovieCatalog.getFeaturedMovies().length == 1,
                "featured catalog query should return featured movies");
        SmokeTestSupport.require(MovieCatalog.getTopRatedMovies(1)[0] == beta,
                "top-rated query should return highest-rated movie");
        SmokeTestSupport.require("Alpha".equals(MovieCatalog.sortByTitle(true)[0].getTitle()),
                "title sorting should be ascending");
        SmokeTestSupport.require(MovieCatalog.sortByReleaseYear(true)[0] == beta,
                "release-year sorting should be descending");
        SmokeTestSupport.require(MovieCatalog.getAvailableGenres().length == 2,
                "available genres should be unique");
        SmokeTestSupport.require(MovieCatalog.getAvailableForStreaming().length == 2,
                "streaming query should exclude unavailable content");
        SmokeTestSupport.require(MovieCatalog.getUpcomingMovies().length == 1,
                "upcoming query should find upcoming content");
        SmokeTestSupport.require(MovieCatalog.filterCatalog("Drama", 12, "Bangla", 2018, 2020).length == 2,
                "combined catalog filter should apply all criteria");
        Movies.clearMovies();
    }

}
