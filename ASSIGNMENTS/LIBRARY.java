// Driver Code
public class LibraryTester {
    public static void main(String[] args) {
        Library l1 = new Library("Ayesha Abed", 3);
        Library l2 = new Library(2);
        System.out.println("1==============");
        l1.details();
        System.out.println("2==============");
        l1.addBook("Java OOP", 450);
        l1.addBook("Data Structures", 520);
        l1.addBook("Algorithms"
        , 600);
        l1.addBook("Database", 380);
        System.out.println("3==============");
        l1.details();
        System.out.println("4==============");
        l1.readBook("Java OOP");
        l1.readBook("Python");
        System.out.println("5==============");
        l2.addBook(l1, "Algorithms");
        l2.addBook(l1, "Networking");
        l2.addBook("Discrete Math", 400);
        l2.addBook("Operating Systems", 550);
        System.out.println("6==============");
        l2.details();
    }
}

public class Library{
    public String name;
    public int capacity;
    public String[] books;
    public String[] pages;
    public int bookcount=0;

    public Library(String name, int capacity){
      this.name = name;
        this.capacity = capacity;
        this.books = new String[capacity];
        this.pages =new int[capacity];
        System.out.println(name + " library created!");
    }
}
 public void classroom{};