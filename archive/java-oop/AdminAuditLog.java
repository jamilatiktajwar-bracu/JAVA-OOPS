public class AdminAuditLog {
    private String[] actions;
    private String[] actors;
    private long[] timestamps;
    private int logCount;

    public AdminAuditLog(int capacity) {
        actions = new String[capacity > 0 ? capacity : 100];
        actors = new String[capacity > 0 ? capacity : 100];
        timestamps = new long[capacity > 0 ? capacity : 100];
        logCount = 0;
    }

    public boolean record(String actor, String action) {
        if (actor == null || actor.trim().isEmpty()
                || action == null || action.trim().isEmpty()
                || logCount >= actions.length) {
            return false;
        }
        actors[logCount] = actor.trim();
        actions[logCount] = action.trim();
        timestamps[logCount] = System.currentTimeMillis();
        logCount++;
        return true;
    }

    public String[] getActions() {
        String[] result = new String[logCount];
        System.arraycopy(actions, 0, result, 0, logCount);
        return result;
    }

    public String[] getActors() {
        String[] result = new String[logCount];
        System.arraycopy(actors, 0, result, 0, logCount);
        return result;
    }

    public long[] getTimestamps() {
        long[] result = new long[logCount];
        System.arraycopy(timestamps, 0, result, 0, logCount);
        return result;
    }

    public int getLogCount() {
        return logCount;
    }

    public String getLatestAction() {
        return logCount == 0 ? "No actions" : actions[logCount - 1];
    }

    public void clear() {
        for (int i = 0; i < logCount; i++) {
            actions[i] = null;
            actors[i] = null;
            timestamps[i] = 0;
        }
        logCount = 0;
    }

    public void display() {
        for (int i = 0; i < logCount; i++) {
            System.out.println(actors[i] + ": " + actions[i]);
        }
    }
}
