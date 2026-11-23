public class bookmark {
    private Movies movie;
    private String label;
    private long createdAt;

    public bookmark() {
        this(null, "Movie");
    }

    public bookmark(Movies movie) {
        this(movie, "Movie");
    }

    public bookmark(Movies movie, String label) {
        this.movie = movie;
        this.label = label == null || label.trim().isEmpty() ? "Movie" : label.trim();
        this.createdAt = System.currentTimeMillis();
    }

    public Movies getMovie() {
        return movie;
    }

    public void setMovie(Movies movie) {
        this.movie = movie;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label == null || label.trim().isEmpty() ? "Movie" : label.trim();
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void display() {
        String name = movie == null ? "Unknown movie" : movie.getTitle();
        System.out.println(label + ": " + name);
    }
}
