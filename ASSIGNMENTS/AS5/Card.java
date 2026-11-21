/*
 * Represents a payment card that can hold money and be linked to an MFS account.
 */
public class Card {
    // Current amount on the card, its type (for example Visa), and linked account.
    private double balance;
    private String type;
    private MFS account;

    // Creates a card with the supplied starting balance and card type.
    public Card(double balance, String type) {
        this.balance = balance;
        this.type = type;
        account = null;

        System.out.println(type + " Card created successfully.");
        System.out.println("Balance: " + balance + " tk");
    }

    // Moves money from the supplied MFS account onto this card.
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

    // Returns the current card balance.
    public double getBalance() {
        return balance;
    }

    // Returns the card type.
    public String getType() {
        return type;
    }

    // Subtracts the specified amount from this card's balance.
    public void deduct(double amount) {
        balance -= amount;
    }

    // Saves the MFS account associated with this card.
    public void setAccount(MFS mfs) {
        account = mfs;
    }

    // Returns the linked account number, or a message if the card is unlinked.
    private String getAccountNo() {
        if (account == null) {
            return "No account";
        }
        return account.getAccNo();
    }
}
