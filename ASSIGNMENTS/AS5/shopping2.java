public class shopping2 {
    public static void main(String[] args) {
        Employee2 employee = new Employee2("Rahim", 5000);
        MFS mfs = new MFS("12121212");

        employee.addMFS(mfs);
        employee.transferSalaryToMFS();

        Card card = new Card(2000, "Visa");
        mfs.addNewCard(card);
        mfs.addMoneyFromCard(1000);

        Shop shop = new Shop("Ghorer Dokan");
        shop.addItem("Rice", 80);
        shop.addItem("Milk", 60);
        shop.addItem("Bread", 40);

        System.out.println("\n===== Shopping =====");
        shop.purchase("Rice", mfs);
        shop.purchase("Mobile", mfs);

        card.addMoneyFromAccount(200, mfs);
        System.out.println("Final MFS balance: " + mfs.getBalance() + " tk");
        System.out.println("Final card balance: " + card.getBalance() + " tk");
    }

    static class Shop {
        private String name;
        private String[] items;
        private double[] prices;
        private int itemCount;

        public Shop(String name) {
            this.name = name;
            items = new String[100];
            prices = new double[100];
            System.out.println("Shop created: " + name);
        }

        public void addItem(String item, double price) {
            if (itemCount >= items.length) {
                System.out.println("Shop is full.");
            } else if (price <= 0) {
                System.out.println("Invalid price.");
            } else {
                items[itemCount] = item;
                prices[itemCount] = price;
                itemCount++;
                System.out.println(item + " added. Price: " + price + " tk");
            }
        }

        public void purchase(String itemName, MFS mfs) {
            for (int i = 0; i < itemCount; i++) {
                if (items[i].equalsIgnoreCase(itemName)) {
                    if (mfs.getBalance() < prices[i]) {
                        System.out.println("Insufficient MFS balance.");
                    } else {
                        mfs.deduct(prices[i]);
                        System.out.println(itemName + " purchased successfully from " + name);
                        System.out.println("Remaining MFS balance: " + mfs.getBalance() + " tk");
                    }
                    return;
                }
            }
            System.out.println(itemName + " is not available in " + name);
        }
    }
}
