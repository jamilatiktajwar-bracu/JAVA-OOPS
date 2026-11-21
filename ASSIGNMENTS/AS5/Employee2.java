public class Employee2 {
    private String name;
    private double salary;
    private MFS mfs;

    public Employee2(String name, double salary) {
        this.name = name;
        this.salary = salary;
        mfs = null;

        System.out.println("Employee created.");
        System.out.println("Name: " + name);
        System.out.println("Salary: " + salary + " tk");
        System.out.println("MFS account not saved.");
    }

    public void addMFS(MFS m) {
        if (mfs == null) {
            mfs = m;
            System.out.println("MFS account added to employee " + name);
        }
    }

    public void transferSalaryToMFS() {
        if (mfs == null) {
            System.out.println("Please add an MFS account to your employee profile");
        } else {
            mfs.addBalance(salary);
            System.out.println("Salary transferred to MFS account.");
            System.out.println("New MFS account balance: " + mfs.getBalance() + " tk.");
        }
    }

    public double getSalary() {
        return salary;
    }
}
