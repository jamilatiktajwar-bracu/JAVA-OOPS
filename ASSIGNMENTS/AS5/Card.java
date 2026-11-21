public class Card {
    private double balance;
    private String type;
    private MFS account;

    public Card(double balance, String type) {
        this.balance = balance;
        this.type = type;
        account = null;

        System.out.println(type + " Card created successfully.");
        System.out.println("Balance: " + balance + " tk");
    }

    public void addMoneyFromAccount(double amount, MFS mfs) {
        if (mfs.getBalance() < amount) {
            System.out.println("Insufficient account balance!");
        } else {
            mfs.deduct(amount);
            balance += amount;

            System.out.println("Added " + amount + " tk to card from MFS");
            System.out.println("account#" + getAccountNo() + ".");
            System.out.println("New balance in card: " + balance + " tk");
        }
    }

    public double getBalance() {
        return balance;
    }

    public String getType() {
        return type;
    }

    public void deduct(double amount) {
        balance -= amount;
    }

    public void setAccount(MFS mfs) {
        account = mfs;
    }

    private String getAccountNo() {
        if (account == null) {
            return "No account";
        }
        return account.getAccNo();
    }
}
