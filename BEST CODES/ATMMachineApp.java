import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Scanner;

class Account {
    private final String pin;
    private BigDecimal balance;

    Account(String pin, BigDecimal balance) {
        this.pin = pin;
        this.balance = balance;
    }

    boolean validatePin(String enteredPin) {
        return pin.equals(enteredPin);
    }

    BigDecimal getBalance() {
        return balance;
    }

    void deposit(BigDecimal amount) {
        balance = balance.add(amount);
        System.out.println("Deposit successful: " + ATM.formatMoney(amount));
    }

    boolean withdraw(BigDecimal amount) {
        if (amount.compareTo(balance) > 0) {
            System.out.println("Error: Insufficient funds.");
            return false;
        }

        balance = balance.subtract(amount);
        System.out.println("Withdrawal successful: " + ATM.formatMoney(amount));
        return true;
    }
}

abstract class Transaction {
    protected final Account account;
    protected final ATM atm;

    Transaction(Account account, ATM atm) {
        this.account = account;
        this.atm = atm;
    }

    abstract boolean execute();
}

class BalanceInquiry extends Transaction {
    BalanceInquiry(Account account, ATM atm) {
        super(account, atm);
    }

    @Override
    boolean execute() {
        System.out.println("\nYour current balance is: " + ATM.formatMoney(account.getBalance()));
        return true;
    }
}

class DepositTransaction extends Transaction {
    DepositTransaction(Account account, ATM atm) {
        super(account, atm);
    }

    @Override
    boolean execute() {
        BigDecimal amount = atm.readAmount("Enter amount to deposit: $");
        if (amount == null) {
            return false;
        }
        account.deposit(amount);
        return true;
    }
}

class WithdrawalTransaction extends Transaction {
    WithdrawalTransaction(Account account, ATM atm) {
        super(account, atm);
    }

    @Override
    boolean execute() {
        BigDecimal amount = atm.readAmount("Enter amount to withdraw: $");
        if (amount == null) {
            return false;
        }
        account.withdraw(amount);
        return true;
    }
}

class BankDatabase {
    private final Map<String, Account> accounts = new HashMap<>();

    BankDatabase() {
        accounts.put("12345", new Account("1111", new BigDecimal("1500.00")));
        accounts.put("67890", new Account("2222", new BigDecimal("3500.50")));
    }

    Account authenticateUser(String accountNumber, String pin) {
        Account account = accounts.get(accountNumber);
        return account != null && account.validatePin(pin) ? account : null;
    }
}

class ATM {
    private static final NumberFormat CURRENCY_FORMAT =
            NumberFormat.getCurrencyInstance(Locale.US);

    private final BankDatabase bankDatabase = new BankDatabase();
    private final Scanner scanner;

    ATM(Scanner scanner) {
        this.scanner = scanner;
    }

    static String formatMoney(BigDecimal amount) {
        return CURRENCY_FORMAT.format(amount);
    }

    void run() {
        System.out.println("=== Welcome to the Java ATM ===");

        while (true) {
            String accountNumber = readLine("\nEnter account number (or 'exit' to quit): ");
            if (accountNumber == null || accountNumber.equalsIgnoreCase("exit")) {
                break;
            }

            String pin = readPin();
            if (pin == null) {
                break;
            }

            Account account = bankDatabase.authenticateUser(accountNumber, pin);
            if (account == null) {
                System.out.println("Authentication failed. Check your account number and PIN.");
                continue;
            }

            if (!performTransactions(account)) {
                break;
            }
        }

        System.out.println("Thank you for using our ATM. Goodbye!");
    }

    private boolean performTransactions(Account account) {
        while (true) {
            System.out.println("\n--- ATM Menu ---");
            System.out.println("1. View balance");
            System.out.println("2. Deposit cash");
            System.out.println("3. Withdraw cash");
            System.out.println("4. Log out");

            String choice = readLine("Choose an option (1-4): ");
            if (choice == null) {
                return false;
            }

            Transaction transaction;
            switch (choice) {
                case "1":
                    transaction = new BalanceInquiry(account, this);
                    break;
                case "2":
                    transaction = new DepositTransaction(account, this);
                    break;
                case "3":
                    transaction = new WithdrawalTransaction(account, this);
                    break;
                case "4":
                    System.out.println("Logged out successfully.");
                    return true;
                default:
                    System.out.println("Invalid choice. Please select 1-4.");
                    continue;
            }

            if (!transaction.execute()) {
                return false;
            }
        }
    }

    BigDecimal readAmount(String prompt) {
        while (true) {
            String input = readLine(prompt);
            if (input == null) {
                return null;
            }

            try {
                BigDecimal amount = new BigDecimal(input).setScale(2, RoundingMode.UNNECESSARY);
                if (amount.signum() > 0) {
                    return amount;
                }
                System.out.println("Enter an amount greater than zero.");
            } catch (NumberFormatException | ArithmeticException exception) {
                System.out.println("Enter a valid amount with no more than 2 decimal places.");
            }
        }
    }

    private String readPin() {
        while (true) {
            String pin = readLine("Enter your 4-digit PIN: ");
            if (pin == null || pin.matches("\\d{4}")) {
                return pin;
            }
            System.out.println("PIN must contain exactly 4 digits.");
        }
    }

    private String readLine(String prompt) {
        System.out.print(prompt);
        return scanner.hasNextLine() ? scanner.nextLine().trim() : null;
    }
}

public class ATMMachineApp {
    public static void main(String[] args) {
        try (Scanner scanner = new Scanner(System.in)) {
            new ATM(scanner).run();
        }
    }
}
