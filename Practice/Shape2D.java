

class Shape2DTester {
    public static void main(String[] args) {
        Shape2D sq = new Shape2D();
        System.out.println("1-------");
        sq.area();
        System.out.println("2-------");
        Shape2D rectangle = new Shape2D(5, 6);
        System.out.println("3-------");
        rectangle.area();
        System.out.println("4-------");
        Shape2D tri1 = new Shape2D(5, 6, "Triangle");
        System.out.println("5-------");
        tri1.area();
        System.out.println("6-------");
        Shape2D tri2 = new Shape2D(5, 6, 7);
        System.out.println("7-------");
        tri2.area();
    }
}

//==========================================================================================================
public class Shape2D {
private String shapeType;
private double dim1, dim2, dim3;
private int sides;   public Shape2D() {
    this.shapeType = "Square";
    this.dim1 = 5;
    this.sides = 1;
    System.out.println("A Square has been created with length: 5");
}


//==========================================================================================================
//==========================================================================================================
public Shape2D(double length, double breadth) {
    this.shapeType = "Rectangle";
    this.dim1 = length;
    this.dim2 = breadth;
    this.sides = 2;
    System.out.println("A Rectangle has been created with length: " + (int)length + " and breadth: " + (int)breadth);
}

public Shape2D(double height, double base, String type) {
    this.shapeType = type;
    this.dim1 = height;
    this.dim2 = base;
    this.sides = 2;
    System.out.println("A Triangle has been created with height: " + (int)height + " and base: " + (int)base);
}

public Shape2D(double side1, double side2, double side3) {
    this.shapeType = "Triangle";
    this.dim1 = side1;
    this.dim2 = side2;
    this.dim3 = side3;
    this.sides = 3;
    System.out.println("A Triangle has been created with the following sides: " + (int)side1 + ", " + (int)side2 + ", " + (int)side3);
}

public void area() {
    double calculatedArea = 0;
    if (shapeType.equals("Square")) {
        calculatedArea = dim1 * dim1;
    } else if (shapeType.equals("Rectangle")) {
        calculatedArea = dim1 * dim2;
    } else if (shapeType.equals("Triangle")) {
        if (sides == 2) {
            calculatedArea = 0.5 * dim1 * dim2;
        } else if (sides == 3) {
            double s = (dim1 + dim2 + dim3) / 2.0;
            calculatedArea = Math.sqrt(s * (s - dim1) * (s - dim2) * (s - dim3));
        }
    }
    System.out.println("The area of the "  + shapeType + " is: " + calculatedArea);
}
}
