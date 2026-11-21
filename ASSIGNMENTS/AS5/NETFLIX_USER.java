public class NETFLIX_USER {
    public String username;
    public String email;
    public String Plan;
    private String password; // Assuming a password field is needed
    public [] favourite_movies; // Assuming an array of favorite movies
    public int favourite_movies_count; // Assuming a count of favorite movies
    
    
    public NETFLIX_USER(String username, String email, String PLAN, String password) {
        this.username = username;
        this.email = email;
        this.favourite_movies = favourite_movies[25]; // Assuming an array of favorite movies
        this.favourite_movies_count = 0;
        this.Plan = PLAN;
        this.setpassword(password);
    }
    public Netflix_USER(String username) {
        this(username, "Free", "", "");
        
    }

    public void showFavouriteMovies() {
        System.out.println("Favourite Movies:");
        for (int i = 0; i < favourite_movies_count; i++) {
            System.out.println(favourite_movies[i].getTitle());
        }
    }

    public void upgradePlan() {
        if (Plan.equals("Free")) {
            System.out.println("Upgrading to pro plan.");
        } else if (Plan.equals("pro")) {
            Plan = "Max";
        } else if (Plan.equals("Max")) {
            System.out.println("You are already on the Max plan.");
        }
    }
    public void setpassword(String password){
    this.password = password;
    }
    public String getpassword(){
    return password;
    }
    


    public NETFLIX_USER(String username, String PLAN) {
        this.username = username;
        this.email = email;
        this.PLAN = PLAN;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    
}