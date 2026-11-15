class Tester5 {public static void main(String[] args) {Library a1 = new Library(3);
                                                       System.out.println("1----------");
                                                       a1.addBook("Ice");
                                                       System.out.println("2----------");
                                                       a1.printDetail();System.out.println("3----------");
                                                       a1.addBook("Emma");
                                                       a1.addBook("Wings");
                                                       a1.addBook("Next");System.out.println("4----------");
                                                       a1.printDetail();System.out.println("5----------");
                                                       Library a2 = new Library(4);
                                                       System.out.println("6----------");
                                                       a2.addBook("Onnobhubon");
                                                       a2.addBook("Ami");
                                                       System.out.println("7----------");
                                                       a2.printDetail();System.out.println("8----------");
                                                       a2.addBook("Deyal");
                                                       a2.addBook("Himu");
                                                       a2.addBook("Megher Upor Bari");
                                                       System.out.println("9----------");
                                                       a2.printDetail();}}  
========================================================================================================== 
  public class Library {
  private int capacity;
  private String[] books;
  private int count = 0; 
  
  public Library(int capacity) {
    this.capacity = capacity;
    this.books = new String[capacity];
    System.out.println("A library has been created with capacity " + capacity);
}

public void addBook(String bookName) {
    if (count < capacity) {
        books[count++] = bookName;
        System.out.println("Book '" + bookName + "' added to the library");
    } else {
        System.out.println("Exceeds maximum capacity. You can't add more than " + capacity + " books");
    }
}

public void printDetail() {
    System.out.println("Maximum Capacity: " + capacity);
    System.out.println("Total Books: " + count);
    System.out.println("Book list:");
    for (int i = 0; i < count; i++) {
        System.out.println(books[i]);
    }
}
}   
