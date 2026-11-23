
class ShapeTester {
    public static void main(String args[]) {
        Shape circle = new Shape();
        Shape triangle = new Shape();
        Shape rectangle = new Shape();
        circle.setParameters("Circle", 5);
        triangle.setParameters("Triangle", 4, 7);
        rectangle.setParameters("Rectangle", 2.4, 4.4);
        System.out.println("1-------");
        System.out.println(circle.details());
        System.out.println("2-------");
        System.out.println(triangle.details());
        System.out.println("3-------");
        System.out.println(rectangle.details());
    }
}

//==========================================================================================================
//==========================================================================================================

public class Shape {
    String name;
    double area;

    public void setParameters(String name, double radius) {
        this.name = name;
        this.area = Math.PI * radius * radius;
    }

    public void setParameters(String name, int base, int height) {
        this.name = name;
        this.area = 0.5 * base * height;
    }

    public void setParameters(String name, double length, double width) {
        this.name = name;
        this.area = length * width;
    }

    public String details() {
        return "Shape Name: " + name + "\nArea: " + String.format("%.2f", area);
    }
}

