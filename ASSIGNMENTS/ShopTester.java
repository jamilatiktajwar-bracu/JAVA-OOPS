// Driver Code
public class ShopTester {
    public static void main(String[] args) {
        Shop s1 = new Shop("Agora", 4);
        Shop s2 = new Shop(3);
        System.out.println("1==============");
        s1.info();
        System.out.println("2==============");
        s2.info();
        System.out.println("3==============");
        s1.addItem("KitKat", 25);
        s1.addItem("Hershey's", 100);
        s1.addItem("Dairy Milk", 150);
        s1.addItem("Feastables", 500);
        s1.addItem("Prime", 1200);
        System.out.println("4==============");
        s1.info();
        System.out.println("5==============");
        s1.purchase("KitKat");
        s1.purchase("Snickers");
        System.out.println("6==============");
        s2.info();
        System.out.println("7==============");
        s2.addItem(s1, "KitKat");
        s2.addItem("Toblerone", 80);
        s2.addItem(s1, "Mars");
        System.out.println("8==============");
        s2.info();
    }
}

// Class Implementation
class Shop {
    String name;
    int capacity;
    String[] items;
    int[] prices;
    int itemCount = 0;

    public Shop(String name, int capacity) {
        this.name = name;
        this.capacity = capacity;
        this.items = new String[capacity];
        this.prices = new int[capacity];
        System.out.println(name + " shop created!");
    }

    public Shop(int capacity) {
        this("Mega", capacity);
    }

    public void info() {
        System.out.println("Shop Name: " + name);
        System.out.println("Item Details:");
        if (itemCount == 0) {
            System.out.println("No items in shop");
        } else {
            for (int i = 0; i < itemCount; i++) {
                System.out.println(items[i] + " " + prices[i] + " Tk");
            }
        }
    }

    public void addItem(String item, int price) {
        if (itemCount < capacity) {
            items[itemCount] = item;
            prices[itemCount] = price;
            itemCount++;
        } else {
            System.out.println(item + ", could not be added");
        }
    }

    public void addItem(Shop s, String item) {
        boolean found = false;
        for (int i = 0; i < s.itemCount; i++) {
            if (s.items[i].equals(item)) {
                addItem(s.items[i], s.prices[i]);
                found = true;
                break;
            }
        }
        if (!found) {
            System.out.println(item + ", not found in " + s.name + "!");
        }
    }

    public void purchase(String item) {
        boolean found = false;
        for (int i = 0; i < itemCount; i++) {
            if (items[i].equals(item)) {
                System.out.println("Purchase Complete!");
                found = true;
                break;
            }
        }
        if (!found) {
            System.out.println(item + ", is not available in this shop");
        }
    }
}