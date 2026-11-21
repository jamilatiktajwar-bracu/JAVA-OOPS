/*
 * Tester program for the MFS-based shopping example.
 *
 * This file uses the Employee2, MFS, and Card classes from this folder.
 * The Shop class is included here so the complete example can be run with
 * this tester file and those existing classes.
 */
public class ShoppingTester {
    public static void main(String[] args) {
        // Create an employee and an MFS account, then connect the two objects.
        Employee2 employee = new Employee2("Rahim", 5000);
        MFS mfs = new MFS("12121212");
        employee.addMFS(mfs);

        // Transfer the employee's salary into the connected MFS account.
        employee.transferSalaryToMFS();

        // Create a card, connect it to the MFS account, and load money from it.
        Card card = new Card(2000, "Visa");
        mfs.addNewCard(card);
        mfs.addMoneyFromCard(1000);

        // Create a shop with room for four products and add products with prices.
        Shop shop = new Shop("Ghorer Dokan", 4);
        shop.addItem("Rice", 80);
        shop.addItem("Milk", 60);
        shop.addItem("Bread", 40);
        shop.addItem("Laptop", 8000);

        // A successful purchase reduces the MFS account balance by the price.
        System.out.println("\n===== Successful purchase =====");
        shop.purchase("Rice", mfs);

        // This product exists, but its price is higher than the available balance.
        System.out.println("\n===== Insufficient balance test =====");
        shop.purchase("Laptop", mfs);

        // This product was never added, so the shop reports that it is unavailable.
        System.out.println("\n===== Unavailable product test =====");
        shop.purchase("Mobile", mfs);

        // Move some money from MFS back to the card, then make another purchase.
        System.out.println("\n===== Card transfer and another purchase =====");
        card.addMoneyFromAccount(200, mfs);
        shop.purchase("Milk", mfs);

        // Print the final balances to see the effect of all transactions.
        System.out.println("\n===== Final balances =====");
        System.out.println("MFS balance: " + mfs.getBalance() + " tk");
        System.out.println("Card balance: " + card.getBalance() + " tk");
    }
}
   