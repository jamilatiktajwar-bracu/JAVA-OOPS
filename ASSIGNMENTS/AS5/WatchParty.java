public class WatchParty {
    private String partyName;
    private Movies movie;
    private NETFLIX_USER host;
    private NETFLIX_USER[] guests;
    private int guestCount;
    private int playbackPosition;
    private boolean playing;
    private boolean chatEnabled;

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
    }

    public boolean invite(NETFLIX_USER guest) {
        if (guest == null || guestCount >= guests.length) {
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
                return true;
            }
        }
        return false;
    }

    public boolean setPlaybackPosition(int position) {
        if (movie == null || position < 0 || position > movie.getDuration()) {
            return false;
        }
        playbackPosition = position;
        return true;
    }

    public void play() {
        playing = true;
    }

    public void pause() {
        playing = false;
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
}
