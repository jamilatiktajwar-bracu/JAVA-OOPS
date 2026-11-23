public class WatchParty {
    private String partyName;
    private Movies movie;
    private NETFLIX_USER host;
    private NETFLIX_USER[] guests;
    private int guestCount;
    private int playbackPosition;
    private boolean playing;
    private boolean chatEnabled;
    private boolean locked;
    private boolean reactionsEnabled;
    private boolean moderationEnabled;
    private boolean partyActive;
    private int maxGuests;
    private long createdAt;
    private long startedAt;
    private int lastSyncPosition;
    private int syncToleranceSeconds;
    private String[] chatMessages;
    private NETFLIX_USER[] chatAuthors;
    private int chatCount;
    private String[] reactions;
    private NETFLIX_USER[] reactionAuthors;
    private int reactionCount;
    private NETFLIX_USER[] mutedGuests;
    private int mutedGuestCount;

    public WatchParty(String partyName, Movies movie, NETFLIX_USER host) {
        this.partyName = partyName == null || partyName.trim().isEmpty()
                ? "Movie Night" : partyName.trim();
        this.movie = movie;
        this.host = host;
        this.guests = new NETFLIX_USER[20];
        this.guestCount = 0;
        this.playbackPosition = 0;
        this.playing = false;
        this.chatEnabled = true;
        this.locked = false;
        this.reactionsEnabled = true;
        this.moderationEnabled = true;
        this.partyActive = true;
        this.maxGuests = 20;
        this.createdAt = System.currentTimeMillis();
        this.startedAt = 0;
        this.lastSyncPosition = 0;
        this.syncToleranceSeconds = 2;
        this.chatMessages = new String[200];
        this.chatAuthors = new NETFLIX_USER[200];
        this.chatCount = 0;
        this.reactions = new String[200];
        this.reactionAuthors = new NETFLIX_USER[200];
        this.reactionCount = 0;
        this.mutedGuests = new NETFLIX_USER[20];
        this.mutedGuestCount = 0;
    }

    public boolean invite(NETFLIX_USER guest) {
        if (guest == null || guest == host || !partyActive || locked
                || guestCount >= maxGuests || guestCount >= guests.length) {
            return false;
        }
        for (int i = 0; i < guestCount; i++) {
            if (guests[i] == guest) {
                return false;
            }
        }
        guests[guestCount++] = guest;
        return true;
    }

    public boolean removeGuest(NETFLIX_USER guest) {
        if (guest == null) {
            return false;
        }
        for (int i = 0; i < guestCount; i++) {
            if (guests[i] == guest) {
                for (int j = i; j < guestCount - 1; j++) {
                    guests[j] = guests[j + 1];
                }
                guests[--guestCount] = null;
                unmuteGuest(guest);
                return true;
            }
        }
        return false;
    }

    public boolean setPlaybackPosition(int position) {
        if (!partyActive || movie == null || position < 0 || position > movie.getDuration()) {
            return false;
        }
        playbackPosition = position;
        lastSyncPosition = position;
        return true;
    }

    public void play() {
        if (!partyActive || movie == null) {
            return;
        }
        playing = true;
        if (startedAt == 0) {
            startedAt = System.currentTimeMillis();
        }
    }

    public void pause() {
        if (partyActive) {
            playing = false;
        }
    }

    public void setChatEnabled(boolean enabled) {
        chatEnabled = enabled;
    }

    public String getPartyName() {
        return partyName;
    }

    public Movies getMovie() {
        return movie;
    }

    public NETFLIX_USER getHost() {
        return host;
    }

    public NETFLIX_USER[] getGuests() {
        NETFLIX_USER[] result = new NETFLIX_USER[guestCount];
        System.arraycopy(guests, 0, result, 0, guestCount);
        return result;
    }

    public int getGuestCount() {
        return guestCount;
    }

    public int getPlaybackPosition() {
        return playbackPosition;
    }

    public boolean isPlaying() {
        return playing;
    }

    public boolean isChatEnabled() {
        return chatEnabled;
    }

    public boolean setMaxGuests(int maxGuests) {
        if (maxGuests < 1 || maxGuests > guests.length || maxGuests < guestCount) {
            return false;
        }
        this.maxGuests = maxGuests;
        return true;
    }

    public int getMaxGuests() {
        return maxGuests;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setReactionsEnabled(boolean enabled) {
        reactionsEnabled = enabled;
    }

    public boolean areReactionsEnabled() {
        return reactionsEnabled;
    }

    public void setModerationEnabled(boolean enabled) {
        moderationEnabled = enabled;
    }

    public boolean isModerationEnabled() {
        return moderationEnabled;
    }

    public boolean sendChat(NETFLIX_USER author, String message) {
        if (!chatEnabled || !partyActive || author == null
                || !isParticipant(author)
                || message == null || message.trim().isEmpty()
                || message.trim().length() > 500
                || chatCount >= chatMessages.length
                || isMuted(author)) {
            return false;
        }
        if (moderationEnabled) {
            String normalized = message.trim().toLowerCase();
            if (normalized.contains("spam") || normalized.contains("abuse")) {
                return false;
            }
        }
        chatMessages[chatCount] = message.trim();
        chatAuthors[chatCount] = author;
        chatCount++;
        return true;
    }

    public String[] getChatMessages() {
        String[] result = new String[chatCount];
        System.arraycopy(chatMessages, 0, result, 0, chatCount);
        return result;
    }

    public NETFLIX_USER[] getChatAuthors() {
        NETFLIX_USER[] result = new NETFLIX_USER[chatCount];
        System.arraycopy(chatAuthors, 0, result, 0, chatCount);
        return result;
    }

    public int getChatCount() {
        return chatCount;
    }

    public boolean sendReaction(NETFLIX_USER author, String reaction) {
        if (!reactionsEnabled || !partyActive || author == null
                || !isParticipant(author)
                || reaction == null || reaction.trim().isEmpty()
                || reaction.trim().length() > 32
                || reactionCount >= reactions.length
                || isMuted(author)) {
            return false;
        }
        reactions[reactionCount] = reaction.trim();
        reactionAuthors[reactionCount] = author;
        reactionCount++;
        return true;
    }

    public String[] getReactions() {
        String[] result = new String[reactionCount];
        System.arraycopy(reactions, 0, result, 0, reactionCount);
        return result;
    }

    public int getReactionCount() {
        return reactionCount;
    }

    public boolean muteGuest(NETFLIX_USER guest) {
        if (guest == null || guest == host || !isParticipant(guest)
                || mutedGuestCount >= mutedGuests.length || isMuted(guest)) {
            return false;
        }
        mutedGuests[mutedGuestCount++] = guest;
        return true;
    }

    public boolean unmuteGuest(NETFLIX_USER guest) {
        if (guest == null) {
            return false;
        }
        for (int i = 0; i < mutedGuestCount; i++) {
            if (mutedGuests[i] == guest) {
                for (int j = i; j < mutedGuestCount - 1; j++) {
                    mutedGuests[j] = mutedGuests[j + 1];
                }
                mutedGuests[--mutedGuestCount] = null;
                return true;
            }
        }
        return false;
    }

    public boolean isMuted(NETFLIX_USER guest) {
        if (guest == null) {
            return false;
        }
        for (int i = 0; i < mutedGuestCount; i++) {
            if (mutedGuests[i] == guest) {
                return true;
            }
        }
        return false;
    }

    public boolean syncGuestPosition(int guestPosition) {
        if (!playing || movie == null || guestPosition < 0
                || guestPosition > movie.getDuration()) {
            return false;
        }
        long difference = Math.abs((long) guestPosition - playbackPosition);
        if (difference <= syncToleranceSeconds) {
            return true;
        }
        playbackPosition = guestPosition;
        lastSyncPosition = guestPosition;
        return false;
    }

    public boolean synchronizeAllGuests(int hostPosition) {
        if (!partyActive || movie == null || hostPosition < 0
                || hostPosition > movie.getDuration()) {
            return false;
        }
        playbackPosition = hostPosition;
        lastSyncPosition = hostPosition;
        return true;
    }

    public void setSyncToleranceSeconds(int seconds) {
        if (seconds >= 0 && seconds <= 30) {
            syncToleranceSeconds = seconds;
        }
    }

    public int getSyncToleranceSeconds() {
        return syncToleranceSeconds;
    }

    public int getLastSyncPosition() {
        return lastSyncPosition;
    }

    public void endParty() {
        partyActive = false;
        playing = false;
    }

    public void restartParty() {
        partyActive = true;
        playing = false;
        startedAt = 0;
        playbackPosition = 0;
        lastSyncPosition = 0;
    }

    public boolean isPartyActive() {
        return partyActive;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public long getStartedAt() {
        return startedAt;
    }

    private boolean isParticipant(NETFLIX_USER user) {
        if (user == null) {
            return false;
        }
        if (user == host) {
            return true;
        }
        for (int i = 0; i < guestCount; i++) {
            if (guests[i] == user) {
                return true;
            }
        }
        return false;
    }
}
