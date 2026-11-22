public class PlaybackQueue {
    private Movies[] queue;
    private int queueCount;
    private int currentIndex;
    private boolean repeatAll;
    private boolean shuffleEnabled;

    public PlaybackQueue(int capacity) {
        queue = new Movies[capacity > 0 ? capacity : 100];
        queueCount = 0;
        currentIndex = 0;
        repeatAll = false;
        shuffleEnabled = false;
    }

    public boolean add(Movies movie) {
        if (movie == null || queueCount >= queue.length) {
            return false;
        }
        queue[queueCount++] = movie;
        return true;
    }

    public boolean addNext(Movies movie) {
        if (movie == null || queueCount >= queue.length) {
            return false;
        }
        for (int i = queueCount; i > currentIndex + 1; i--) {
            queue[i] = queue[i - 1];
        }
        queue[currentIndex + 1] = movie;
        queueCount++;
        return true;
    }

    public boolean remove(Movies movie) {
        for (int i = 0; i < queueCount; i++) {
            if (queue[i] == movie) {
                for (int j = i; j < queueCount - 1; j++) {
                    queue[j] = queue[j + 1];
                }
                queue[--queueCount] = null;
                if (i < currentIndex) {
                    currentIndex--;
                }
                return true;
            }
        }
        return false;
    }

    public Movies getCurrent() {
        if (queueCount == 0 || currentIndex < 0 || currentIndex >= queueCount) {
            return null;
        }
        return queue[currentIndex];
    }

    public Movies next() {
        if (queueCount == 0) {
            return null;
        }
        if (shuffleEnabled) {
            currentIndex = (int) (Math.random() * queueCount);
        } else {
            currentIndex++;
        }
        if (currentIndex >= queueCount) {
            if (repeatAll) {
                currentIndex = 0;
            } else {
                currentIndex = queueCount - 1;
                return null;
            }
        }
        return queue[currentIndex];
    }

    public Movies previous() {
        if (queueCount == 0) {
            return null;
        }
        currentIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        return queue[currentIndex];
    }

    public void clear() {
        for (int i = 0; i < queueCount; i++) {
            queue[i] = null;
        }
        queueCount = 0;
        currentIndex = 0;
    }

    public Movies[] getQueue() {
        Movies[] result = new Movies[queueCount];
        System.arraycopy(queue, 0, result, 0, queueCount);
        return result;
    }

    public int getQueueCount() {
        return queueCount;
    }

    public int getCurrentIndex() {
        return currentIndex;
    }

    public void setRepeatAll(boolean repeatAll) {
        this.repeatAll = repeatAll;
    }

    public boolean isRepeatAll() {
        return repeatAll;
    }

    public void setShuffleEnabled(boolean shuffleEnabled) {
        this.shuffleEnabled = shuffleEnabled;
    }

    public boolean isShuffleEnabled() {
        return shuffleEnabled;
    }
}
