public class PaymentMethod {
    private String type;
    private String maskedNumber;
    private String holderName;
    private int expiryMonth;
    private int expiryYear;
    private boolean defaultMethod;

    public PaymentMethod(String type, String number, String holderName) {
        this.type = type == null || type.trim().isEmpty() ? "Card" : type.trim();
        this.maskedNumber = mask(number);
        this.holderName = holderName == null ? "" : holderName.trim();
        this.expiryMonth = 1;
        this.expiryYear = 2027;
        this.defaultMethod = false;
    }

    private String mask(String number) {
        if (number == null) {
            return "****";
        }
        String value = number.replaceAll("\\D", "");
        if (value.isEmpty()) {
            return "****";
        }
        int visibleDigits = Math.min(4, value.length());
        return "**** **** **** " + value.substring(value.length() - visibleDigits);
    }

    public boolean setExpiry(int month, int year) {
        if (month < 1 || month > 12 || year < 1900 || year > 2200) {
            return false;
        }
        expiryMonth = month;
        expiryYear = year;
        return true;
    }

    public boolean isExpired(int currentYear, int currentMonth) {
        if (currentMonth < 1 || currentMonth > 12) {
            return false;
        }
        return expiryYear < currentYear
                || (expiryYear == currentYear && expiryMonth < currentMonth);
    }

    public void setDefault(boolean defaultMethod) {
        this.defaultMethod = defaultMethod;
    }

    public String getType() {
        return type;
    }

    public String getMaskedNumber() {
        return maskedNumber;
    }

    public String getHolderName() {
        return holderName;
    }

    public int getExpiryMonth() {
        return expiryMonth;
    }

    public int getExpiryYear() {
        return expiryYear;
    }

    public boolean isDefaultMethod() {
        return defaultMethod;
    }

    public void display() {
        System.out.printf("%s: %s (%s), expires %02d/%d%n",
                type, maskedNumber,
                holderName.isEmpty() ? "No holder name" : holderName,
                expiryMonth, expiryYear);
    }
}
