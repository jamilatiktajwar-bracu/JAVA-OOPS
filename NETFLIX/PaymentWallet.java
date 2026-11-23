public class PaymentWallet {
    private PaymentMethod[] methods;
    private int methodCount;

    public PaymentWallet(int capacity) {
        methods = new PaymentMethod[capacity > 0 ? capacity : 5];
        methodCount = 0;
    }

    public boolean addMethod(PaymentMethod method) {
        if (method == null || methodCount >= methods.length || contains(method)) {
            return false;
        }
        methods[methodCount++] = method;
        setDefault(methodCount == 1 ? method : getDefaultMethod());
        return true;
    }

    private boolean contains(PaymentMethod method) {
        for (int i = 0; i < methodCount; i++) {
            if (methods[i] == method) {
                return true;
            }
        }
        return false;
    }

    public boolean removeMethod(PaymentMethod method) {
        if (method == null) {
            return false;
        }
        int index = -1;
        for (int i = 0; i < methodCount; i++) {
            if (methods[i] == method) {
                index = i;
                break;
            }
        }
        if (index < 0) {
            return false;
        }
        boolean wasDefault = method.isDefaultMethod();
        for (int i = index; i < methodCount - 1; i++) {
            methods[i] = methods[i + 1];
        }
        methods[--methodCount] = null;
        if (wasDefault && methodCount > 0) {
            setDefault(methods[0]);
        }
        return true;
    }

    public boolean setDefault(PaymentMethod method) {
        if (!contains(method)) {
            return false;
        }
        for (int i = 0; i < methodCount; i++) {
            methods[i].setDefault(methods[i] == method);
        }
        return true;
    }

    public PaymentMethod getDefaultMethod() {
        for (int i = 0; i < methodCount; i++) {
            if (methods[i].isDefaultMethod()) {
                return methods[i];
            }
        }
        return null;
    }

    public PaymentMethod[] getMethods() {
        PaymentMethod[] result = new PaymentMethod[methodCount];
        System.arraycopy(methods, 0, result, 0, methodCount);
        return result;
    }

    public int getMethodCount() {
        return methodCount;
    }

    public void display() {
        for (int i = 0; i < methodCount; i++) {
            methods[i].display();
        }
    }
}
