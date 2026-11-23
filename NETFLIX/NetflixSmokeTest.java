public class NetflixSmokeTest {
    public static void main(String[] args) {
        Movies.clearMovies();
        Movies.addMovie("Alpha", "Drama", 100, 2020);
        Movies.addMovie("Beta", "Comedy", 110, 2021);
        Movies.addMovie("Gamma", "Action", 120, 2022);
        Movies.addMovie("Delta", "Sci-Fi", 130, 2023);

        NETFLIX_USER user = new NETFLIX_USER("smoke-user");
        RecommendationEngine engine = new RecommendationEngine(user);
        check(engine.recommend(3).length <= 3, "recommend respects limit");
        check(engine.getSurpriseRecommendations(10).length <= 4,
                "surprise recommendation respects catalog size");

        engine.clearRecommendationHistory();
        Movies[] surprise = engine.getSurpriseRecommendations(4);
        for (int i = 0; i < surprise.length; i++) {
            for (int j = i + 1; j < surprise.length; j++) {
                check(surprise[i] != surprise[j], "surprise picks are unique");
            }
        }

        RecommendationEngine noUser = new RecommendationEngine(null);
        check(noUser.recommend(5).length == 0, "null-user recommendations safe");
        check(noUser.getGenreRecommendations("Drama", 5).length == 0,
                "null-user genre recommendations safe");
        check(noUser.getSurpriseRecommendations(5).length == 0,
                "null-user surprise recommendations safe");
        check("No movie or user context".equals(noUser.explainRecommendation(null)),
                "null recommendation explanation safe");

        System.out.println("NETFLIX_SMOKE_TEST_OK");
    }

    private static void check(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
