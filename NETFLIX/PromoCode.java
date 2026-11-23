public class PromoCode {
    private String code;
    private double discountPercent;
    private int maxUses;
    private int currentUses;
    private boolean active;
    private long expiresAt;

    public PromoCode(String code, double discountPercent, int maxUses) {
        String normalizedCode = code == null ? "" : code.trim().toUpperCase();
        this.code = normalizedCode.isEmpty() ? "PROMO" : normalizedCode;
        this.discountPercent = Double.isFinite(discountPercent) ? discountPercent : 0.0;
        this.maxUses = maxUses > 0 ? maxUses : 1;
        this.currentUses = 0;
        this.active = true;
        this.expiresAt = System.currentTimeMillis()
                + 30L * 24L * 60L * 60L * 1000L;
    }

    public boolean redeem(Subscription subscription) {
        if (!isValid() || subscription == null) {
            return false;
        }
        if (!subscription.applyCoupon(code, discountPercent)) {
            return false;
        }
        currentUses++;
        if (currentUses >= maxUses) {
            active = false;
        }
        return true;
    }

    public boolean isValid() {
        return active
                && discountPercent > 0.0
                && discountPercent <= 90.0
                && Double.isFinite(discountPercent)
                && !code.isEmpty()
                && currentUses < maxUses
                && System.currentTimeMillis() < expiresAt;
    }

    public void deactivate() {
        active = false;
    }

    public void setExpiry(long expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getCode() {
        return code;
    }

    public double getDiscountPercent() {
        return discountPercent;
    }

    public int getRemainingUses() {
        return maxUses - currentUses;
    }

    public long getExpiresAt() {
        return expiresAt;
    }
}
