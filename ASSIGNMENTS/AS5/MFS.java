
/*
 * Represents a mobile financial service (MFS) account.
 * The account can hold money and be associated with one card.
 */
public class MFS {
    // Account identifier, current money, and the card linked to this account.
    private String accNo;
    private double balance;
    private Card card;

    // Creates an account with no money and no card linked yet.
    public MFS(String accNo) {
        this.accNo = accNo;
        balance = 0;
        card = null;

        System.out.println("Account created.");
        System.out.println("AccNo: " + accNo);
        System.out.println("Balance: " + balance + " tk");
        System.out.println("Card not saved.");
    }

    // Links a card to this account if no card has already been linked.
    public void addNewCard(Card c) {
        if (card == null) {
            card = c;
            c.setAccount(this);
            System.out.println(c.getType() + " Card added to MFS acc#" + accNo);
        }
    }

    // Transfers money from the linked card into this MFS account.
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

    // Returns the current account balance without changing it.
    public double getBalance() {
        return balance;
    }

    // Returns this account's identifier.
    public String getAccNo() {
        return accNo;
    }

    // Deducts money only when the amount is positive and the balance is enough.
    public void deduct(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
        }
    }

    // Adds the given amount to this account's balance.
    public void addBalance(double amount) {
        balance += amount;
    }
}