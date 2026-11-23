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


        // Playback queue regression checks: cursor stability and cleanup.
        Movies queueA = new Movies("Queue A", "Drama", 90);
        Movies queueB = new Movies("Queue B", "Comedy", 95);
        Movies queueC = new Movies("Queue C", "Action", 100);
        PlaybackQueue queue = new PlaybackQueue(5);
        check(queue.add(queueA) && queue.add(queueB) && queue.add(queueC),
                "queue accepts valid items");
        check(queue.next() == queueB, "queue advances to second item");
        check(queue.remove(queueB), "remove current item succeeds");
        check(queue.getCurrent() == queueC && queue.getCurrentIndex() == 1,
                "removing current selects next item safely");
        check(queue.remove(queueC), "remove current tail succeeds");
        check(queue.getCurrent() == queueA && queue.getCurrentIndex() == 0,
                "removing tail keeps cursor in range");
        check(queue.next() == null, "queue reaches end safely");
        check(queue.next() == queueA, "next after end restarts from first item");
        queue.clear();
        check(queue.getQueueCount() == 0 && queue.getCurrent() == null
                && queue.getHistoryCount() == 0, "clear resets queue and history");
        check(queue.addNext(queueC) && queue.getCurrent() == queueC,
                "add-next initializes cursor after clear");

        PlaybackQueue shuffleQueue = new PlaybackQueue(3);
        shuffleQueue.add(queueA);
        shuffleQueue.add(queueB);
        shuffleQueue.setShuffleEnabled(true);
        check(shuffleQueue.next() != null, "shuffle advances with multiple entries");
        check(shuffleQueue.getCurrent() != null, "shuffle current remains valid");

        System.out.println("NETFLIX_SMOKE_TEST_OK");
    }

    private static void check(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
