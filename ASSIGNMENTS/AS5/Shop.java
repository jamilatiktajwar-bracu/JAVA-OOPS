/*
 * Represents a shop whose products and prices are stored in parallel arrays.
 * The product at items[i] has its price at prices[i].
 */
public class Shop {
        private String name;
        private String[] items;
        private double[] prices;
        private int itemCount;

        public Shop(String name, int capacity) {
            this.name = name;

            // Declare the arrays as fields and allocate their storage here.
            items = new String[capacity];
            prices = new double[capacity];
            itemCount = 0;

            System.out.println(name + " shop created.");
        }

        public void addItem(String item, double price) {
            // Do not write beyond the array capacity or accept a non-positive price.
            if (itemCount >= items.length) {
                System.out.println("Shop is full. Could not add " + item + ".");
            } else if (price <= 0) {
                System.out.println("Invalid price for " + item + ".");
            } else {
                items[itemCount] = item;
                prices[itemCount] = price;
                itemCount++;
                System.out.println(item + " added for " + price + " tk.");
            }
        }

        public void purchase(String itemName, MFS mfs) {
            // Search only the filled part of the arrays, not their unused slots.
            for (int i = 0; i < itemCount; i++) {
                if (items[i].equalsIgnoreCase(itemName)) {
                    if (mfs.getBalance() < prices[i]) {
                        System.out.println("Insufficient MFS balance to buy " + itemName + ".");
                    } else {
                        // Deduct the product price from the buyer's MFS account.
                        mfs.deduct(prices[i]);
                        System.out.println(itemName + " purchased from " + name + ".");
                        System.out.println("Remaining MFS balance: " + mfs.getBalance() + " tk");
                    }
                    return;
                }
            }

            // Reaching here means no matching product was found.
            System.out.println(itemName + " is not available in " + name + ".");
        }
}
