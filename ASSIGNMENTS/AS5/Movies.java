public class Movies {
    private String title;
    private String genre;
    private int duration;
    private static final Movies[] movieList = new Movies[100];
    private static int movieCount;

    public Movies(String title, String genre, int duration) {
        this.title = title;
        this.genre = genre;
        this.duration = duration;
    }

    public Movies(String title, String genre) {
        this.title = title;
        this.genre = genre;
        this.duration = 0; // Default duration if not provided
    }

    public static boolean addMovie(String title, String genre, int duration) {
        if (movieCount >= movieList.length) {
            return false;
        }

        movieList[movieCount++] = new Movies(title, genre, duration);
        
        return true;
    }

    public static boolean addMovie(String title, String genre) {
        if (movieCount >= movieList.length) {
            return false;
        }

        movieList[movieCount++] = new Movies(title, genre);
        return true;
    }

    public static Movies getMovie(int index) {
        if (index < 0 || index >= movieCount) {
            throw new IndexOutOfBoundsException("Invalid movie index: " + index);
        }
        return movieList[index];
    }

    public static int getMovieCount() {
        return movieCount;
    }

    public void play() {
        System.out.println("Playing " + title + " (" + genre + ", " + duration + " minutes)");
    }
    public void displayInfo() {
        System.out.println("Title: " + title);
        System.out.println("Genre: " + genre);
        System.out.println("Duration: " + duration + " minutes");
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public void setGenre(String genre) {
        this.genre = genre;
    }
    public void setDuration(int duration) {
        this.duration = duration;
    }
    public String getTitle() {
        return title;
    }

    public String getGenre() {
        return genre;
    }

    public int getDuration() {
        return duration;
    }
}
