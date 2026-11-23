final class BillingSmokeTests {
    static void run() {
        testSubscriptionPlanNormalization();
        testSubscriptionPaymentAndRefundSafety();
        testPaymentWalletDefaultInvariant();
        testPromoCodeRedemptionConsistency();
        testPaymentMethodExpiryValidation();
    }

    private static void testSubscriptionPlanNormalization() {
            SubscriptionPlan invalid = new SubscriptionPlan("Invalid", Double.NaN, 0, 5000);
            SmokeTestSupport.require(invalid.getMonthlyFee() == 0.0, "invalid fee should normalize to zero");
            SmokeTestSupport.require(invalid.getScreens() == 1, "invalid screen count should normalize to one");
            SmokeTestSupport.require(invalid.getResolutionQuality() == 720, "invalid resolution should normalize to default");
            SmokeTestSupport.require(!invalid.isDownloadsEnabled(), "download capability should follow normalized fee");
            SmokeTestSupport.require(!invalid.isSpatialAudioEnabled(), "spatial audio should follow normalized resolution");
            SmokeTestSupport.require(SubscriptionPlan.maxPlan().isSpatialAudioEnabled(), "Max plan should enable spatial audio");
        }
    
    private static void testSubscriptionPaymentAndRefundSafety() {
            Subscription subscription = new Subscription("Pro");
            subscription.setPaymentMethod("Visa");
            SmokeTestSupport.require(subscription.processPayment(700.0), "valid subscription payment should succeed");
            SmokeTestSupport.require(subscription.getInvoiceCount() == 1, "successful payment should create invoice");
            SmokeTestSupport.require(subscription.refundInvoice(0), "paid invoice should be refundable");
            SmokeTestSupport.require(!subscription.refundInvoice(0), "invoice must not be refunded twice");
            SmokeTestSupport.require(subscription.getRefundedAmount() == 700.0, "refund total should track one refund");
    
            Subscription fullInvoices = new Subscription("Pro");
            fullInvoices.setPaymentMethod("Visa");
            for (int i = 0; i < 100; i++) {
                SmokeTestSupport.require(fullInvoices.createInvoice(1.0, "Pending"), "invoice capacity should fill");
            }
            SmokeTestSupport.require(!fullInvoices.processPayment(700.0), "payment must fail when invoice history is full");
            SmokeTestSupport.require(fullInvoices.getBillingHistoryCount() == 0, "failed payment must not add billing history");
    
            Subscription cancelled = new Subscription("Pro");
            cancelled.cancel();
            cancelled.processFailedPayment();
            SmokeTestSupport.require(cancelled.getFailedPaymentCount() == 0, "cancelled subscription should ignore payment failure");
            SmokeTestSupport.require(cancelled.getOutstandingBalance() == 0.0, "cancelled subscription should not accrue balance");
        }
    
    private static void testPaymentWalletDefaultInvariant() {
            PaymentWallet wallet = new PaymentWallet(3);
            PaymentMethod first = new PaymentMethod("Card", "123456", "First");
            PaymentMethod second = new PaymentMethod("Card", "654321", "Second");
            second.setDefault(true);
            SmokeTestSupport.require(wallet.addMethod(first), "first method should be added");
            SmokeTestSupport.require(wallet.getDefaultMethod() == first, "first wallet method should become default");
            SmokeTestSupport.require(wallet.addMethod(second), "second method should be added");
            SmokeTestSupport.require(wallet.getDefaultMethod() == first, "externally pre-marked default must not override wallet default");
            SmokeTestSupport.require(wallet.setDefault(second), "wallet should allow switching default");
            SmokeTestSupport.require(wallet.removeMethod(second), "default method should be removable");
            SmokeTestSupport.require(wallet.getDefaultMethod() == first, "wallet should select remaining method as default");
            SmokeTestSupport.require(wallet.getMethodCount() == 1, "wallet count should remain consistent");
        }
    
    private static void testPromoCodeRedemptionConsistency() {
            Subscription subscription = new Subscription("Pro");
            PromoCode first = new PromoCode("SAVE10", 10.0, 5);
            PromoCode second = new PromoCode("SAVE20", 20.0, 5);
            SmokeTestSupport.require(first.redeem(subscription), "first promo should redeem");
            SmokeTestSupport.require(!second.redeem(subscription), "second promo should not replace active coupon");
            SmokeTestSupport.require(first.getRemainingUses() == 4, "successful redemption should consume one use");
            SmokeTestSupport.require(second.getRemainingUses() == 5, "failed redemption should not consume promo usage");
            subscription.removeCoupon();
            SmokeTestSupport.require(second.redeem(subscription), "second promo should redeem after active coupon is removed");
        }
        private static void testPaymentMethodExpiryValidation() {
            PaymentMethod method = new PaymentMethod("  ", "12-3456", " Holder ");
            SmokeTestSupport.require("Card".equals(method.getType()), "blank card type should normalize");
            SmokeTestSupport.require("**** **** **** 3456".equals(method.getMaskedNumber()),
                    "card number should be masked to last four digits");
            java.util.Calendar now = java.util.Calendar.getInstance();
            int year = now.get(java.util.Calendar.YEAR);
            int month = now.get(java.util.Calendar.MONTH) + 1;
            SmokeTestSupport.require(!method.setExpiry(0, year + 2), "invalid expiry month should fail");
            SmokeTestSupport.require(!method.setExpiry(month, year - 1), "past expiry year should fail");
            int pastMonth = month == 1 ? 12 : month - 1;
            int pastYear = month == 1 ? year - 1 : year;
            SmokeTestSupport.require(!method.setExpiry(pastMonth, pastYear), "past expiry month should fail");
            SmokeTestSupport.require(method.setExpiry(month, year + 2), "future expiry should succeed");
            SmokeTestSupport.require(!method.isExpired(year, month), "future expiry should not be expired");
            SmokeTestSupport.require(!method.isExpired(year, 13), "invalid current month should not be accepted");
        }
    
}
