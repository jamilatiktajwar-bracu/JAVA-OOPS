public class SystemHealthMonitor {
    private int uptimeSeconds;
    private int activeSessions;
    private int failedJobs;
    private int warningCount;
    private boolean maintenanceMode;

    public SystemHealthMonitor() {
        uptimeSeconds = 0;
        activeSessions = 0;
        failedJobs = 0;
        warningCount = 0;
        maintenanceMode = false;
    }

    public void addUptimeSeconds(int seconds) {
        if (seconds > 0) {
            uptimeSeconds = (int) Math.min(Integer.MAX_VALUE, (long) uptimeSeconds + seconds);
        }
    }

    public void setActiveSessions(int sessions) {
        if (sessions >= 0) {
            activeSessions = sessions;
        }
    }

    public void recordFailedJob() {
        if (failedJobs < Integer.MAX_VALUE) {
            failedJobs++;
        }
    }

    public void recordWarning() {
        if (warningCount < Integer.MAX_VALUE) {
            warningCount++;
        }
    }

    public void setMaintenanceMode(boolean enabled) {
        maintenanceMode = enabled;
    }

    public String getStatus() {
        if (maintenanceMode) {
            return "Maintenance";
        }
        if (failedJobs >= 10) {
            return "Critical";
        }
        if (failedJobs > 0 || warningCount >= 5) {
            return "Degraded";
        }
        return "Healthy";
    }

    public int getUptimeSeconds() {
        return uptimeSeconds;
    }

    public int getActiveSessions() {
        return activeSessions;
    }

    public int getFailedJobs() {
        return failedJobs;
    }

    public int getWarningCount() {
        return warningCount;
    }

    public boolean isMaintenanceMode() {
        return maintenanceMode;
    }

    public String getSummary() {
        return "Status: " + getStatus()
                + ", Uptime: " + uptimeSeconds
                + "s, Active sessions: " + activeSessions
                + ", Failed jobs: " + failedJobs
                + ", Warnings: " + warningCount;
    }
}
