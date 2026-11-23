public class SubscriptionPlan {
    private String name;
    private double monthlyFee;
    private int screens;
    private int resolutionQuality;
    private boolean downloadsEnabled;
    private boolean spatialAudioEnabled;

    public SubscriptionPlan(String name, double monthlyFee,
            int screens, int resolutionQuality) {
        this.name = name == null || name.trim().isEmpty() ? "Free" : name.trim();
        this.monthlyFee = Double.isFinite(monthlyFee) && monthlyFee >= 0.0
                ? monthlyFee : 0.0;
        this.screens = screens > 0 ? screens : 1;
        this.resolutionQuality = resolutionQuality >= 480 && resolutionQuality <= 4320
                ? resolutionQuality : 720;
        this.downloadsEnabled = this.monthlyFee > 0.0;
        this.spatialAudioEnabled = this.resolutionQuality >= 2160;
    }

    public static SubscriptionPlan freePlan() {
        return new SubscriptionPlan("Free", 0.0, 1, 720);
    }

    public static SubscriptionPlan proPlan() {
        return new SubscriptionPlan("Pro", 700.0, 2, 1080);
    }

    public static SubscriptionPlan maxPlan() {
        return new SubscriptionPlan("Max", 1200.0, 4, 2160);
    }

    public int compareWith(SubscriptionPlan other) {
        if (other == null) {
            return 1;
        }
        return Double.compare(monthlyFee, other.monthlyFee);
    }

    public double getMonthlyFee() {
        return monthlyFee;
    }

    public String getName() {
        return name;
    }

    public int getScreens() {
        return screens;
    }

    public int getResolutionQuality() {
        return resolutionQuality;
    }

    public boolean isDownloadsEnabled() {
        return downloadsEnabled;
    }

    public boolean isSpatialAudioEnabled() {
        return spatialAudioEnabled;
    }

    public void display() {
        System.out.println(name + ": " + monthlyFee
                + " tk/month, " + screens + " screens, "
                + resolutionQuality + "p");
    }
}
