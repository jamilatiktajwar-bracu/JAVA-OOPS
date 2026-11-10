// Driver Code
public class StudentDriver {
    public static void main(String[] args) {
        Student student1 = new Student(12345678);
        System.out.println("1------------");
        student1.addCourse("CSE110");
        System.out.println("2------------");
        student1.storeCG(2.5);
        student1.addCourse("CSE110");
        student1.addCourse("ENG101");
        student1.showAdvisee();
        System.out.println("3------------");
        student1.removeAllCourse();
        student1.showAdvisee();
        System.out.println("4------------");
        student1.storeID(54652365);
        student1.addCourse(new String[]{"SOC101", "CSE111", "ENG102"});
        student1.showAdvisee();
        System.out.println("5------------");
        student1.addCourse("CSE230");
        student1.showAdvisee();
        System.out.println("6------------");
        Student student2 = new Student(975738383, 3.7);
        System.out.println("7------------");
        String[] courses2 = {"CSE220", "PHY112", "MAT120", "BUS101", "CHN101"};
        student2.addCourse(courses2);
        student2.showAdvisee();
    }
}

// Class Implementation
class Student {
    int id;
    double cgpa;
    boolean cgpaSet = false;
    String[] courses = new String[4];
    int courseCount = 0;

    public Student(int id) {
        this.id = id;
        System.out.println("A student with ID " + id + " has been created.");
    }

    public Student(int id, double cgpa) {
        this.id = id;
        this.cgpa = cgpa;
        this.cgpaSet = true;
        System.out.println("A student with ID " + id + " and cgpa " + cgpa + " has been created.");
    }

    public void storeCG(double cgpa) {
        this.cgpa = cgpa;
        this.cgpaSet = true;
    }

    public void storeID(int id) {
        this.id = id;
    }

    public void addCourse(String course) {
        if (!cgpaSet) {
            System.out.println("Failed to add " + course + "\nSet CG first");
            return;
        }
        int limit = (cgpa < 3.0) ? 3 : 4;
        if (courseCount >= limit) {
            System.out.println("Failed to add " + course);
            if (cgpa < 3.0 && courseCount == 3) {
                System.out.println("CG is low. Can't add more than 3 courses.");
            } else {
                System.out.println("Maximum 4 courses allowed.");
            }
            return;
        }
        courses[courseCount++] = course;
    }

    public void addCourse(String[] courseArray) {
        for (String c : courseArray) {
            addCourse(c);
        }
    }

    public void removeAllCourse() {
        courseCount = 0;
    }

    public void showAdvisee() {
        System.out.println("Student ID: " + id + ", CGPA: " + cgpa);
        if (courseCount == 0) {
            System.out.println("No courses added.");
        } else {
            System.out.println("Added courses are:");
            for (int i = 0; i < courseCount; i++) {
                System.out.print(courses[i] + " ");
            }
            System.out.println();
        }
    }
}
