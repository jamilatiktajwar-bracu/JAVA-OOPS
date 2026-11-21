/*
 * Represents an employee who can save an MFS account and transfer salary to it.
 */
public class Employee2 {
    // Employee details and the MFS account connected to this employee, if any.
    private String name;
    private double salary;
    private MFS mfs;

    // Creates an employee; no MFS account is connected initially.
    public Employee2(String name, double salary) {
        this.name = name;
        this.salary = salary;
        mfs = null;

        System.out.println("Employee created.");
        System.out.println("Name: " + name);
        System.out.println("Salary: " + salary + " tk");
        System.out.println("MFS account not saved.");
    }

    // Connects the given MFS account if this employee does not already have one.
    public void addMFS(MFS m) {
        if (mfs == null) {
            mfs = m;
            System.out.println("MFS account added to employee " + name);
        }
    }

    // Adds this employee's salary to the connected MFS account.
    public void transferSalaryToMFS() {
        if (mfs == null) {
            System.out.println("Please add an MFS account to your employee profile");
        } else {
            mfs.addBalance(salary);
            System.out.println("Salary transferred to MFS account.");
            System.out.println("New MFS account balance: " + mfs.getBalance() + " tk.");
        }
    }

    // Returns the employee's salary.
    public double getSalary() {
        return salary;
    }
}
