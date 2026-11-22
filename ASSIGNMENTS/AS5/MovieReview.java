public class MovieReview {
    private String reviewerName;
    private double rating;
    private String comment;
    private long createdAt;

    public MovieReview(String reviewerName, double rating, String comment) {
        this.reviewerName = reviewerName == null || reviewerName.trim().isEmpty()
                ? "Anonymous" : reviewerName.trim();
        this.rating = rating;
        this.comment = comment == null ? "" : comment.trim();
        this.createdAt = System.currentTimeMillis();
    }

    public boolean isValid() {
        return rating >= 0.0 && rating <= 10.0;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public double getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void display() {
        System.out.println(reviewerName + " rated " + rating + "/10");
        if (!comment.isEmpty()) {
            System.out.println("Comment: " + comment);
        }
    }
}
