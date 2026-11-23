public class NetflixPlaylist {
    private String name;
    private Movies[] movies;
    private int movieCount;
    private String description;
    private boolean publicPlaylist;
    private long createdAt;
    private long updatedAt;
    private int currentPosition;

    public NetflixPlaylist(String name) {
        this.name = name == null || name.trim().isEmpty() ? "My Playlist" : name.trim();
        this.movies = new Movies[100];
        this.movieCount = 0;
        initializeMetadata();
    }

    public NetflixPlaylist(String name, int capacity) {
        this.name = name == null || name.trim().isEmpty() ? "My Playlist" : name.trim();
        this.movies = new Movies[capacity > 0 ? capacity : 100];
        this.movieCount = 0;
        initializeMetadata();
    }

    private void initializeMetadata() {
        this.description = "";
        this.publicPlaylist = false;
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = createdAt;
        this.currentPosition = 0;
    }

    public boolean addMovie(Movies movie) {
        if (movie == null || contains(movie) || movieCount >= movies.length) {
            return false;
        }
        movies[movieCount++] = movie;
        touch();
        return true;
    }

    public int addMovies(Movies[] items) {
        int added = 0;
        if (items == null) {
            return 0;
        }
        for (Movies movie : items) {
            if (addMovie(movie)) {
                added++;
            }
        }
        return added;
    }

    public boolean removeMovie(Movies movie) {
        if (movie == null) {
            return false;
        }
        for (int i = 0; i < movieCount; i++) {
            if (movies[i] == movie) {
                for (int j = i; j < movieCount - 1; j++) {
                    movies[j] = movies[j + 1];
                }
                movies[--movieCount] = null;
                if (i < currentPosition) {
                    currentPosition--;
                } else if (i == currentPosition && currentPosition >= movieCount) {
                    currentPosition = 0;
                }
                touch();
                return true;
            }
        }
        return false;
    }

    public boolean contains(Movies movie) {
        if (movie == null) {
            return false;
        }
        for (int i = 0; i < movieCount; i++) {
            if (movies[i] == movie) {
                return true;
            }
        }
        return false;
    }

    public Movies[] getMovies() {
        Movies[] result = new Movies[movieCount];
        System.arraycopy(movies, 0, result, 0, movieCount);
        return result;
    }

    public void clear() {
        for (int i = 0; i < movieCount; i++) {
            movies[i] = null;
        }
        movieCount = 0;
        currentPosition = 0;
        touch();
    }

    public boolean removeMovieAt(int index) {
        if (index < 0 || index >= movieCount) {
            return false;
        }
        Movies removed = movies[index];
        return removeMovie(removed);
    }

    public Movies getMovieAt(int index) {
        if (index < 0 || index >= movieCount) {
            return null;
        }
        return movies[index];
    }

    public int indexOf(Movies movie) {
        if (movie == null) {
            return -1;
        }
        for (int i = 0; i < movieCount; i++) {
            if (movies[i] == movie) {
                return i;
            }
        }
        return -1;
    }

    public boolean moveMovie(int fromIndex, int toIndex) {
        if (fromIndex < 0 || fromIndex >= movieCount
                || toIndex < 0 || toIndex >= movieCount
                || fromIndex == toIndex) {
            return false;
        }
        Movies movie = movies[fromIndex];
        if (fromIndex < toIndex) {
            for (int i = fromIndex; i < toIndex; i++) {
                movies[i] = movies[i + 1];
            }
        } else {
            for (int i = fromIndex; i > toIndex; i--) {
                movies[i] = movies[i - 1];
            }
        }
        movies[toIndex] = movie;
        if (currentPosition == fromIndex) {
            currentPosition = toIndex;
        } else if (fromIndex < currentPosition && toIndex >= currentPosition) {
            currentPosition--;
        } else if (fromIndex > currentPosition && toIndex <= currentPosition) {
            currentPosition++;
        }
        touch();
        return true;
    }

    public boolean moveMovieToTop(Movies movie) {
        int index = indexOf(movie);
        return index >= 0 && moveMovie(index, 0);
    }

    public boolean moveMovieToBottom(Movies movie) {
        int index = indexOf(movie);
        return index >= 0 && moveMovie(index, movieCount - 1);
    }

    public void sortByTitle(boolean ascending) {
        for (int i = 0; i < movieCount - 1; i++) {
            for (int j = i + 1; j < movieCount; j++) {
                int comparison = movies[i].getTitle()
                        .compareToIgnoreCase(movies[j].getTitle());
                if ((ascending && comparison > 0)
                        || (!ascending && comparison < 0)) {
                    Movies temporary = movies[i];
                    movies[i] = movies[j];
                    movies[j] = temporary;
                }
            }
        }
        currentPosition = 0;
        touch();
    }

    public void sortByRating(boolean descending) {
        for (int i = 0; i < movieCount - 1; i++) {
            for (int j = i + 1; j < movieCount; j++) {
                if ((descending && movies[i].getRating() < movies[j].getRating())
                        || (!descending && movies[i].getRating() > movies[j].getRating())) {
                    Movies temporary = movies[i];
                    movies[i] = movies[j];
                    movies[j] = temporary;
                }
            }
        }
        currentPosition = 0;
        touch();
    }

    public void sortByReleaseYear(boolean descending) {
        for (int i = 0; i < movieCount - 1; i++) {
            for (int j = i + 1; j < movieCount; j++) {
                if ((descending && movies[i].getReleaseYear() < movies[j].getReleaseYear())
                        || (!descending && movies[i].getReleaseYear() > movies[j].getReleaseYear())) {
                    Movies temporary = movies[i];
                    movies[i] = movies[j];
                    movies[j] = temporary;
                }
            }
        }
        currentPosition = 0;
        touch();
    }

    public void shuffle() {
        for (int i = movieCount - 1; i > 0; i--) {
            int j = (int) (Math.random() * (i + 1));
            Movies temporary = movies[i];
            movies[i] = movies[j];
            movies[j] = temporary;
        }
        currentPosition = 0;
        touch();
    }

    public Movies[] filterByGenre(String genre) {
        if (genre == null) {
            return new Movies[0];
        }
        Movies[] result = new Movies[movieCount];
        int count = 0;
        for (int i = 0; i < movieCount; i++) {
            if (movies[i].getGenre().equalsIgnoreCase(genre.trim())) {
                result[count++] = movies[i];
            }
        }
        Movies[] filtered = new Movies[count];
        System.arraycopy(result, 0, filtered, 0, count);
        return filtered;
    }

    public Movies getNextMovie() {
        if (movieCount == 0) {
            return null;
        }
        if (currentPosition >= movieCount) {
            currentPosition = 0;
        }
        return movies[currentPosition++];
    }

    public Movies getPreviousMovie() {
        if (movieCount == 0) {
            return null;
        }
        currentPosition--;
        if (currentPosition < 0) {
            currentPosition = movieCount - 1;
        }
        return movies[currentPosition];
    }

    public void resetPosition() {
        currentPosition = 0;
    }

    public int getCurrentPosition() {
        return currentPosition;
    }

    public int getTotalDuration() {
        long total = 0L;
        for (int i = 0; i < movieCount; i++) {
            total += Math.max(0, movies[i].getDuration());
            if (total >= Integer.MAX_VALUE) {
                return Integer.MAX_VALUE;
            }
        }
        return (int) total;
    }

    public double getAverageRating() {
        if (movieCount == 0) {
            return 0.0;
        }
        double total = 0.0;
        for (int i = 0; i < movieCount; i++) {
            total += movies[i].getRating();
        }
        return total / movieCount;
    }

    public int getCapacity() {
        return movies.length;
    }

    public int getRemainingCapacity() {
        return movies.length - movieCount;
    }

    public boolean isFull() {
        return movieCount >= movies.length;
    }

    public boolean isEmpty() {
        return movieCount == 0;
    }

    public void setDescription(String description) {
        this.description = description == null ? "" : description.trim();
        touch();
    }

    public String getDescription() {
        return description;
    }

    public void setPublic(boolean publicPlaylist) {
        this.publicPlaylist = publicPlaylist;
        touch();
    }

    public boolean isPublic() {
        return publicPlaylist;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    private void touch() {
        updatedAt = System.currentTimeMillis();
    }

    public int getMovieCount() {
        return movieCount;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name.trim();
            touch();
        }
    }

    public void display() {
        System.out.println("Playlist: " + name);
        if (movieCount == 0) {
            System.out.println("(empty)");
            return;
        }
        for (int i = 0; i < movieCount; i++) {
            System.out.println((i + 1) + ". " + movies[i].getTitle());
        }
    }
}
