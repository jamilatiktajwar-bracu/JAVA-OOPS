public class MovieReview {
    private String reviewerName;
    private double rating;
    private String comment;
    private long createdAt;
    private long updatedAt;
    private boolean verifiedViewer;
    private boolean spoiler;
    private boolean approved;
    private boolean reported;
    private int helpfulVotes;
    private int notHelpfulVotes;
    private int reportCount;
    private String[] tags;
    private int tagCount;

    public MovieReview(String reviewerName, double rating, String comment) {
        this.reviewerName = reviewerName == null || reviewerName.trim().isEmpty()
                ? "Anonymous" : reviewerName.trim();
        this.rating = Double.isFinite(rating) ? Math.max(0.0, Math.min(10.0, rating)) : 0.0;
        this.comment = comment == null ? "" : comment.trim();
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = createdAt;
        this.verifiedViewer = false;
        this.spoiler = false;
        this.approved = true;
        this.reported = false;
        this.helpfulVotes = 0;
        this.notHelpfulVotes = 0;
        this.reportCount = 0;
        this.tags = new String[10];
        this.tagCount = 0;
    }

    public boolean isValid() {
        return Double.isFinite(rating) && rating >= 0.0 && rating <= 10.0;
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

    public boolean edit(String newComment, double newRating) {
        if (newComment == null || newComment.trim().isEmpty()
                || !Double.isFinite(newRating)
                || newRating < 0.0 || newRating > 10.0) {
            return false;
        }
        comment = newComment.trim();
        rating = newRating;
        updatedAt = System.currentTimeMillis();
        return true;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public boolean wasEdited() {
        return updatedAt != createdAt;
    }

    public void setVerifiedViewer(boolean verifiedViewer) {
        this.verifiedViewer = verifiedViewer;
    }

    public boolean isVerifiedViewer() {
        return verifiedViewer;
    }

    public void setSpoiler(boolean spoiler) {
        this.spoiler = spoiler;
        updatedAt = System.currentTimeMillis();
    }

    public boolean containsSpoiler() {
        return spoiler;
    }

    public void markApproved() {
        approved = true;
        reported = false;
    }

    public void markRejected() {
        approved = false;
    }

    public boolean isApproved() {
        return approved;
    }

    public void addHelpfulVote() {
        if (helpfulVotes < Integer.MAX_VALUE) {
            helpfulVotes++;
        }
    }

    public void removeHelpfulVote() {
        if (helpfulVotes > 0) {
            helpfulVotes--;
        }
    }

    public void addNotHelpfulVote() {
        if (notHelpfulVotes < Integer.MAX_VALUE) {
            notHelpfulVotes++;
        }
    }

    public void removeNotHelpfulVote() {
        if (notHelpfulVotes > 0) {
            notHelpfulVotes--;
        }
    }

    public int getHelpfulVotes() {
        return helpfulVotes;
    }

    public int getNotHelpfulVotes() {
        return notHelpfulVotes;
    }

    public int getHelpfulnessScore() {
        long score = (long) helpfulVotes - (long) notHelpfulVotes;
        return (int) Math.max(Integer.MIN_VALUE, Math.min(Integer.MAX_VALUE, score));
    }

    public boolean report() {
        if (reportCount < Integer.MAX_VALUE) {\n            if (reportCount < Integer.MAX_VALUE) {
            reportCount++;
        }\n        }
        reported = true;
        if (reportCount >= 3) {
            approved = false;
        }
        return true;
    }

    public boolean isReported() {
        return reported;
    }

    public int getReportCount() {
        return reportCount;
    }

    public boolean addTag(String tag) {
        if (tag == null || tag.trim().isEmpty() || tagCount >= tags.length) {
            return false;
        }
        String value = tag.trim();
        for (int i = 0; i < tagCount; i++) {
            if (tags[i].equalsIgnoreCase(value)) {
                return false;
            }
        }
        tags[tagCount++] = value;
        return true;
    }

    public String[] getTags() {
        String[] result = new String[tagCount];
        System.arraycopy(tags, 0, result, 0, tagCount);
        return result;
    }

    public int getTagCount() {
        return tagCount;
    }

    public boolean needsReview() {
        return reported || reportCount > 0 || containsSpoiler();
    }

    public void display() {
        System.out.println(reviewerName + " rated " + rating + "/10");
        if (verifiedViewer) {
            System.out.println("Verified viewer");
        }
        if (!comment.isEmpty()) {
            System.out.println("Comment: " + comment);
        }
        if (spoiler) {
            System.out.println("[Spoiler warning]");
        }
        if (!approved) {
            System.out.println("[Review awaiting moderation]");
        }
        System.out.println("Helpful: " + helpfulVotes
                + ", Not helpful: " + notHelpfulVotes);
    }
}
