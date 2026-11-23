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

        // Watch-party membership, playback, and moderation edge cases.
        NETFLIX_USER host = new NETFLIX_USER("party-host");
        NETFLIX_USER guest = new NETFLIX_USER("party-guest");
        WatchParty party = new WatchParty("Regression Party", queueA, host);
        check(!party.invite(host), "watch party cannot invite host as guest");
        check(party.invite(guest), "watch party accepts guest");
        check(!party.invite(guest), "watch party rejects duplicate guest");
        check(party.muteGuest(guest), "host can mute a guest");
        check(!party.sendChat(guest, "hello"), "muted guest chat is blocked");
        check(party.removeGuest(guest), "guest can be removed");
        check(!party.isMuted(guest), "removed guest mute state is cleared");
        check(!party.setPlaybackPosition(-1), "watch party rejects negative position");
        check(party.setPlaybackPosition(20), "watch party accepts valid position");
        party.play();
        check(!party.syncGuestPosition(-5), "sync rejects invalid guest position");
        party.endParty();
        check(!party.invite(guest), "ended party cannot invite guests");
        party.restartParty();
        check(!party.isPlaying() && party.getPlaybackPosition() == 0,
                "restart resets playback state");

        // Promo codes and wallet defensive behavior.
        Subscription promoSubscription = new Subscription("Pro");
        PromoCode promo = new PromoCode(" save10 ", 10.0, 1);
        check(promo.redeem(promoSubscription), "promo redeems valid subscription");
        check(Math.abs(promoSubscription.getEffectiveMonthlyFee() - 630.0) < 0.001,
                "promo discount applies correctly");
        check(!promo.redeem(promoSubscription), "single-use promo cannot be redeemed twice");
        PromoCode invalidPromo = new PromoCode("INVALID", 120.0, 2);
        check(!invalidPromo.isValid(), "invalid promo discount is rejected");

        PaymentWallet wallet = new PaymentWallet(2);
        PaymentMethod paymentA = new PaymentMethod("Card", "12345678", "Test");
        PaymentMethod paymentB = new PaymentMethod("Card", "87654321", "Test");
        check(wallet.addMethod(paymentA) && wallet.addMethod(paymentB),
                "wallet accepts methods within capacity");
        check(wallet.getDefaultMethod() == paymentA, "first wallet method is default");
        check(wallet.setDefault(paymentB), "wallet can switch default method");
        check(wallet.removeMethod(paymentB), "wallet removes method");
        check(wallet.getDefaultMethod() == paymentA, "wallet reassigns default after removal");

        Subscription billing = new Subscription("Pro");
        billing.setPaymentMethod("Visa **** 4242");
        check(billing.processPayment(700.0), "configured subscription payment succeeds");
        check(billing.getInvoiceCount() == 1 && billing.getInvoiceStatuses()[0].equals("Paid"),
                "successful payment creates paid invoice");
        check(billing.refundInvoice(0), "paid invoice can be refunded");
        check(!billing.refundInvoice(0), "invoice cannot be refunded twice");
        check(Math.abs(billing.getRefundedAmount() - 700.0) < 0.001,
                "refund total is not double counted");
        check(!billing.processPayment(Double.NaN), "payment rejects NaN");
        check(!billing.processPayment(-1.0), "payment rejects negative amount");
        billing.pauseBilling();
        billing.processFailedPayment();
        check(billing.getFailedPaymentCount() == 0,
                "paused subscription ignores failed payment event");
        check(billing.resumeBilling(), "paused subscription resumes");
        NETFLIX_USER profileOwner = new NETFLIX_USER("profile-owner");
        NETFLIX_USER childProfile = new NETFLIX_USER("child-profile");
        check(!profileOwner.addFamilyProfile(profileOwner),
                "profile cannot add itself to family profiles");
        check(profileOwner.addFamilyProfile(childProfile),
                "family profile can be added");
        check(!profileOwner.addFamilyProfile(childProfile),
                "duplicate family profile is rejected");
        check(!profileOwner.setPassword("short"),
                "password setter rejects short passwords");
        check(profileOwner.setPassword("long-enough-password"),
                "password setter accepts longer password");
        Movies completedMovie = new Movies("Nearly Finished", "Drama", 100);
        check(profileOwner.updateViewingProgress(completedMovie, 96),
                "new near-complete movie progress accepted");
        check(completedMovie.isWatched()
                && profileOwner.getContinueWatchingCount() == 0,
                "near-complete movie is marked watched without queue residue");
        System.out.println("NETFLIX_SMOKE_TEST_OK");
    }

    private static void check(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
