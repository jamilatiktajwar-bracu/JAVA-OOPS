


public class MFS {
    private String accNo;
    private double balance;
    private Card card;

    public MFS(String accNo) {
        this.accNo = accNo;
        balance = 0;
        card = null;

        System.out.println("Account created.");
        System.out.println("AccNo: " + accNo);
        System.out.println("Balance: " + balance + " tk");
        System.out.println("Card not saved.");
    }

    public void addNewCard(Card c) {
        if (card == null) {
            card = c;
            c.setAccount(this);
            System.out.println(c.getType() + " Card added to MFS acc#" + accNo);
        }
    }

    public void addMoneyFromCard(double amount) {
        if (card == null) {
            System.out.println("Please add a card to your MFS account");
        } else if (amount <= 0) {
            System.out.println("Invalid amount.");
        } else if (card.getBalance() < amount) {
            System.out.println("Insufficient balance in " + card.getType() + " Card.");
        } else {
            card.deduct(amount);
            balance += amount;

            System.out.println("Transfer successful.");
            System.out.println("New MFS account balance: " + balance + " tk.");
            System.out.println("Card balance: " + card.getBalance() + " tk");
        }
    }

    public double getBalance() {
        return balance;
    }

    public String getAccNo() {
        return accNo;
    }

    public void deduct(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
        }
    }

    public void addBalance(double amount) {
        balance += amount;
    }
}