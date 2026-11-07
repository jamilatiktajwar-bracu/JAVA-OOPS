CLASSWORK: Task 4  


class TaxiTester {public static void main(String[] args)
{TaxiLagbe taxi1 = new TaxiLagbe("1010-01", "Dhaka");
System.out.println("1----------");
taxi1.printDetails();System.out.println("2----------");
taxi1.addPassenger("Wilson", 105);
System.out.println("3----------");
taxi1.printDetails();System.out.println("4----------");
taxi1.addPassenger("Walker", 100, "Wood", 200);
System.out.println("5----------");
taxi1.printDetails();
System.out.println("6----------");
taxi1.addPassenger("Karen", 200);
taxi1.addPassenger("Donald", 130);
System.out.println("7----------");
taxi1.printDetails();
System.out.println("8----------");
TaxiLagbe taxi2 = new TaxiLagbe("1010-02");
System.out.println("9----------");
taxi2.addPassenger("Don", 115, "Parker", 215);
System.out.println("10---------");
taxi2.printDetails();}}   
==========================================================================================================  

public class TaxiLagbe {
         private String taxiNumber;
         private String area;
         private String[] passengers = new String[4];
         private int passengerCount = 0;
         private int totalFare = 0;   

public TaxiLagbe(String taxiNumber, String area) {
    this.taxiNumber = taxiNumber;
    this.area = area;
    System.out.println("A new taxi has been created");
}

public TaxiLagbe(String taxiNumber) {
    this.taxiNumber = taxiNumber;
    this.area = "Khulna"; 
    System.out.println("A new taxi has been created");
}

public void addPassenger(String name, int fare) {
    if (passengerCount < 4) {
        passengers[passengerCount++] = name;
        totalFare += fare;
        System.out.println("Dear " + name + "! Welcome to TaxiLagbe");
    } else {
        System.out.println("Taxi Full! No more passengers can be added");
    }
}

public void addPassenger(String name1, int fare1, String name2, int fare2) {
    addPassenger(name1, fare1);
    addPassenger(name2, fare2);
}

public void printDetails() {
    System.out.println("Taxi number: " + taxiNumber);
    System.out.println("This taxi can cover " + area + " area");
    System.out.println("Total Passenger: " + passengerCount);
    System.out.print("Passenger List:\n");
    for (int i = 0; i < passengerCount; i++) {
        System.out.print(passengers[i] + (i < passengerCount - 1 ? " " : ""));
    }
    System.out.println("\nTotal collected fare: " + totalFare + " Taka");
}
}
