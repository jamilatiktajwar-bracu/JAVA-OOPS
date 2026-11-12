public class shop{

    String name;
    int capacity;
   String[] items;
   int[] prices;
   int itemCount = 0;

   public shop(String name, int capacity){ 
       
    this.name = name;
    this.capacity = capacity;
    this.items = new String[capacity];
    this.prices = new int[capacity];
    System.out.println(name + " shop created!");
    
}

  public Shop(int capacity ) {
    this("Mega", capacity);
  }
  public void addItem(String item, int price){
    if (itemCount < capacity) {
        items[itemCount] = item ;
        prices[itemCount] = price ;
        itemCount++;
    }
  else{
        System.out.println(item + ", could not be added");
  } 
}
public void addItem (Shop s, String item ) {
  boolean found = false ;
  
}


}
