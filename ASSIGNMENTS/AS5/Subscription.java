public class Subscription {
    private String planName;
    private double monthlyFee;
    private int screenLimit;
    private boolean active;
    private int billingDay;
    private String billingCycle;
    private double discountPercent;
    private String couponCode;
    private int trialDaysRemaining;
    private boolean inTrial;
    private double[] billingHistory;
    private int billingHistoryCount;
    private boolean autoRenew;
    private long nextBillingTime;
    private long startTime;
    private String paymentMethod;
    private String billingStatus;
    private int failedPaymentCount;
    private int gracePeriodDays;
    private double outstandingBalance;
    private double refundedAmount;
    private double[] invoiceAmount;
    private String[] invoiceStatus;
    private long[] invoiceTime;
    private int invoiceCount;
    private boolean paused;

    public Subscription(String planName) {
        setPlan(planName);
        this.active = true;
        this.billingDay = 1;
        initializeBilling();
    }

    public Subscription(String planName, int billingDay) {
        setPlan(planName);
        this.active = true;
        this.billingDay = billingDay >= 1 && billingDay <= 28 ? billingDay : 1;
        initializeBilling();
    }

    private void initializeBilling() {
        this.billingCycle = "Monthly";
        this.discountPercent = 0.0;
        this.couponCode = "";
        this.trialDaysRemaining = 0;
        this.inTrial = false;
        this.billingHistory = new double[100];
        this.billingHistoryCount = 0;
        this.autoRenew = true;
        this.startTime = System.currentTimeMillis();
        this.nextBillingTime = startTime + 30L * 24L * 60L * 60L * 1000L;
        this.paymentMethod = "Not configured";
        this.billingStatus = "Current";
        this.failedPaymentCount = 0;
        this.gracePeriodDays = 7;
        this.outstandingBalance = 0.0;
        this.refundedAmount = 0.0;
        this.invoiceAmount = new double[100];
        this.invoiceStatus = new String[100];
        this.invoiceTime = new long[100];
        this.invoiceCount = 0;
        this.paused = false;
    }

    public void setPlan(String planName) {
        if (planName == null) {
            planName = "Free";
        }
        String value = planName.trim();
        if (value.equalsIgnoreCase("Max")) {
            this.planName = "Max";
            this.monthlyFee = 1200;
            this.screenLimit = 4;
        } else if (value.equalsIgnoreCase("Pro")) {
            this.planName = "Pro";
            this.monthlyFee = 700;
            this.screenLimit = 2;
        } else {
            this.planName = "Free";
            this.monthlyFee = 0;
            this.screenLimit = 1;
        }
    }

    public boolean upgrade() {
        if (planName.equals("Free")) {
            setPlan("Pro");
            touchBilling();
            return true;
        }
        if (planName.equals("Pro")) {
            setPlan("Max");
            touchBilling();
            return true;
        }
        return false;
    }

    public boolean downgrade() {
        if (planName.equals("Max")) {
            setPlan("Pro");
            touchBilling();
            return true;
        }
        if (planName.equals("Pro")) {
            setPlan("Free");
            touchBilling();
            return true;
        }
        return false;
    }

    public void cancel() {
        active = false;
        autoRenew = false;
    }

    public void renew() {
        active = true;
        autoRenew = true;
        nextBillingTime = System.currentTimeMillis()
                + 30L * 24L * 60L * 60L * 1000L;
    }

    public String getPlanName() {
        return planName;
    }

    public double getMonthlyFee() {
        return monthlyFee;
    }

    public int getScreenLimit() {
        return screenLimit;
    }

    public int getBillingDay() {
        return billingDay;
    }

    public boolean isActive() {
        return active;
    }

    public boolean startTrial(int days) {
        if (days <= 0 || inTrial) {
            return false;
        }
        inTrial = true;
        trialDaysRemaining = days;
        active = true;
        nextBillingTime = System.currentTimeMillis()
                + (long) days * 24L * 60L * 60L * 1000L;
        return true;
    }

    public boolean consumeTrialDay() {
        if (!inTrial) {
            return false;
        }
        if (trialDaysRemaining > 0) {
            trialDaysRemaining--;
        }
        if (trialDaysRemaining == 0) {
            inTrial = false;
        }
        return true;
    }

    public boolean applyCoupon(String code, double discountPercent) {
        if (code == null || code.trim().isEmpty()
                || discountPercent <= 0.0 || discountPercent > 90.0) {
            return false;
        }
        this.couponCode = code.trim();
        this.discountPercent = discountPercent;
        return true;
    }

    public void removeCoupon() {
        couponCode = "";
        discountPercent = 0.0;
    }

    public double getEffectiveMonthlyFee() {
        return monthlyFee * (1.0 - discountPercent / 100.0);
    }

    public boolean addBillingRecord(double amount) {
        if (amount < 0.0 || billingHistoryCount >= billingHistory.length) {
            return false;
        }
        billingHistory[billingHistoryCount++] = amount;
        touchBilling();
        return true;
    }

    public double[] getBillingHistory() {
        double[] result = new double[billingHistoryCount];
        System.arraycopy(billingHistory, 0, result, 0, billingHistoryCount);
        return result;
    }

    public int getBillingHistoryCount() {
        return billingHistoryCount;
    }

    public double getTotalPaid() {
        double total = 0.0;
        for (int i = 0; i < billingHistoryCount; i++) {
            total += billingHistory[i];
        }
        return total;
    }

    public void setBillingCycle(String billingCycle) {
        if (billingCycle == null) {
            return;
        }
        String value = billingCycle.trim();
        if (value.equalsIgnoreCase("Monthly")
                || value.equalsIgnoreCase("Yearly")
                || value.equalsIgnoreCase("Quarterly")) {
            this.billingCycle = value;
            touchBilling();
        }
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setAutoRenew(boolean autoRenew) {
        this.autoRenew = autoRenew;
    }

    public boolean isAutoRenew() {
        return autoRenew;
    }

    public void setPaymentMethod(String paymentMethod) {
        if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
            this.paymentMethod = paymentMethod.trim();
        }
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public double getDiscountPercent() {
        return discountPercent;
    }

    public boolean isInTrial() {
        return inTrial;
    }

    public int getTrialDaysRemaining() {
        return trialDaysRemaining;
    }

    public long getNextBillingTime() {
        return nextBillingTime;
    }

    public long getStartTime() {
        return startTime;
    }

    public void setBillingDay(int billingDay) {
        if (billingDay >= 1 && billingDay <= 28) {
            this.billingDay = billingDay;
        }
    }

    public double estimateYearlyCost() {
        if (billingCycle.equalsIgnoreCase("Yearly")) {
            return getEffectiveMonthlyFee() * 12.0 * 0.9;
        }
        return getEffectiveMonthlyFee() * 12.0;
    }

    public boolean processPayment(double amount) {
        if (amount <= 0.0 || paymentMethod.equals("Not configured")) {
            return false;
        }
        if (addBillingRecord(amount)) {
            createInvoice(amount, "Paid");
            outstandingBalance = 0.0;
            failedPaymentCount = 0;
            billingStatus = "Current";
            return true;
        }
        return false;
    }

    public void processFailedPayment() {
        failedPaymentCount++;
        outstandingBalance += getEffectiveMonthlyFee();
        billingStatus = failedPaymentCount >= 3 ? "Suspended" : "Past Due";
    }

    public boolean retryFailedPayment() {
        if (failedPaymentCount == 0 || paymentMethod.equals("Not configured")) {
            return false;
        }
        if (processPayment(getEffectiveMonthlyFee())) {
            failedPaymentCount = 0;
            outstandingBalance = 0.0;
            active = true;
            paused = false;
            return true;
        }
        processFailedPayment();
        return false;
    }

    public boolean createInvoice(double amount, String status) {
        if (invoiceCount >= invoiceAmount.length || amount < 0.0) {
            return false;
        }
        String safeStatus = status == null ? "Pending" : status.trim();
        if (!safeStatus.equalsIgnoreCase("Paid")
                && !safeStatus.equalsIgnoreCase("Pending")
                && !safeStatus.equalsIgnoreCase("Refunded")) {
            safeStatus = "Pending";
        }
        invoiceAmount[invoiceCount] = amount;
        invoiceStatus[invoiceCount] = safeStatus;
        invoiceTime[invoiceCount] = System.currentTimeMillis();
        invoiceCount++;
        return true;
    }

    public boolean refundLatestInvoice() {
        if (invoiceCount == 0) {
            return false;
        }
        int index = invoiceCount - 1;
        if (!invoiceStatus[index].equalsIgnoreCase("Paid")) {
            return false;
        }
        refundedAmount += invoiceAmount[index];
        invoiceStatus[index] = "Refunded";
        billingStatus = "Refunded";
        return true;
    }

    public boolean refundInvoice(int index) {
        if (index < 0 || index >= invoiceCount
                || !invoiceStatus[index].equalsIgnoreCase("Paid")) {
            return false;
        }
        refundedAmount += invoiceAmount[index];
        invoiceStatus[index] = "Refunded";
        return true;
    }

    public double[] getInvoiceAmounts() {
        double[] result = new double[invoiceCount];
        System.arraycopy(invoiceAmount, 0, result, 0, invoiceCount);
        return result;
    }

    public String[] getInvoiceStatuses() {
        String[] result = new String[invoiceCount];
        System.arraycopy(invoiceStatus, 0, result, 0, invoiceCount);
        return result;
    }

    public int getInvoiceCount() {
        return invoiceCount;
    }

    public double getOutstandingBalance() {
        return outstandingBalance;
    }

    public double getRefundedAmount() {
        return refundedAmount;
    }

    public int getFailedPaymentCount() {
        return failedPaymentCount;
    }

    public String getBillingStatus() {
        return billingStatus;
    }

    public void setGracePeriodDays(int days) {
        if (days >= 0 && days <= 30) {
            gracePeriodDays = days;
        }
    }

    public int getGracePeriodDays() {
        return gracePeriodDays;
    }

    public boolean pauseBilling() {
        if (!active) {
            return false;
        }
        paused = true;
        autoRenew = false;
        return true;
    }

    public boolean resumeBilling() {
        if (!paused) {
            return false;
        }
        paused = false;
        autoRenew = true;
        active = true;
        touchBilling();
        return true;
    }

    public boolean isPaused() {
        return paused;
    }

    public boolean isPastDue() {
        return billingStatus.equals("Past Due");
    }

    public boolean isSuspended() {
        return billingStatus.equals("Suspended");
    }

    public double calculateProration(double oldMonthlyFee,
            double newMonthlyFee, int remainingDays, int cycleDays) {
        if (oldMonthlyFee < 0.0 || newMonthlyFee < 0.0
                || remainingDays < 0 || cycleDays <= 0) {
            return 0.0;
        }
        int safeRemaining = Math.min(remainingDays, cycleDays);
        double difference = newMonthlyFee - oldMonthlyFee;
        return difference * ((double) safeRemaining / cycleDays);
    }

    private void touchBilling() {
        nextBillingTime = System.currentTimeMillis()
                + 30L * 24L * 60L * 60L * 1000L;
    }

    public void display() {
        System.out.println("Plan: " + planName);
        System.out.println("Monthly fee: " + monthlyFee);
        System.out.println("Screens: " + screenLimit);
        System.out.println("Billing day: " + billingDay);
        System.out.println("Subscription: " + (active ? "Active" : "Cancelled"));
    }
}
