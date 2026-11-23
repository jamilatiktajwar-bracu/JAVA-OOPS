final class SmokeTestSupport {
    private SmokeTestSupport() { }
    static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException("Smoke test failed: " + message);
    }
}
