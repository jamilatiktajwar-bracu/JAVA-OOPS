public class NETFLIX_SMOKE_TEST {
    public static void main(String[] args) {
        CatalogSmokeTests.run();
        PlaybackSmokeTests.run();
        BillingSmokeTests.run();
        UserFeatureSmokeTests.run();
        System.out.println("Netflix smoke tests passed.");
    }
}
