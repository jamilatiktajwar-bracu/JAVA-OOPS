import java.util.Locale;
import java.util.Scanner;

public class Employee {
    // Instance Variables
    public String name;
    public double salary;
    public String designation;

    public static void main(String[] args) {
        try (Scanner scanner = new Scanner(System.in)) {
            System.out.print("Enter employee name: ");
            String employeeName = scanner.nextLine().trim();
            if (employeeName.isEmpty()) {
                System.out.println("Employee name cannot be empty.");
                return;
            }

            Employee employee = new Employee();
            employee.newEmployee(employeeName);
            employee.displayInfo();
            employee.calculateTax();

            System.out.print("Promotion (senior/lead/manager), or press Enter to skip: ");
            String newPosition = scanner.nextLine().trim().toLowerCase(Locale.ROOT);
            if (newPosition.isEmpty()) {
                return;
            }
            if (!newPosition.equals("senior")
                    && !newPosition.equals("lead")
                    && !newPosition.equals("manager")) {
                System.out.println("Invalid promotion. Choose senior, lead, or manager.");
                return;
            }

            employee.promoteEmployee(newPosition);
            employee.calculateTax();
        }
    }
    
    // New employee join korle
    public void newEmployee(String empName) {
        name = empName;
        salary = 30000;        // Fixed starting salary
        designation = "junior"; // Starting position
    }
    
    // Tax calculate kora
    public void calculateTax() {
        if (salary > 50000) {
            // 30% tax
            double tax = salary * 0.30;
            System.out.println(name + " Tax Amount: " + tax + " Tk");
        } else if (salary > 30000) {
            // 10% tax
            double tax = salary * 0.10;
            System.out.println(name + " Tax Amount: " + tax + " Tk");
        } else {
            // No tax
            System.out.println("No need to pay tax");
        }
    }
    
    // Promotion dawa
    public void promoteEmployee(String newPosition) {
        designation = newPosition;  // Notun position set
        
        // Salary increment
        if (newPosition.equals("senior")) {
            salary = salary + 25000;
        } else if (newPosition.equals("lead")) {
            salary = salary + 50000;
        } else if (newPosition.equals("manager")) {
            salary = salary + 75000;
        }
        
        // Print promotion message
        System.out.println(name + " has been promoted to " + newPosition);
        System.out.println("New Salary: " + String.format("%.2f", salary) + " Tk");
    }
    
    // Details print kora
    public void displayInfo() {
        System.out.println("Employee Name: " + name);
        System.out.println("Employee Salary: " + salary + " Tk");
        System.out.println("Employee Designation: " + designation);
    }
}
