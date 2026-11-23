package io.storyspace.accounts;
import jakarta.persistence.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="accounts")
public class Account {
 @Id @GeneratedValue private UUID id;
 @Column(nullable=false,unique=true,length=190) private String email;
 @Column(nullable=false) private String passwordHash;
 @Column(nullable=false,length=80) private String displayName;
 @Column(nullable=false,length=20) private String role="USER";
 @Column(length=1000) private String favoriteGenres="";
 @Column(length=1000) private String favoriteMoods="";
 @Column(length=500) private String preferredLanguages="English";
 @Column(nullable=false) private Instant createdAt=Instant.now();
 protected Account(){}
 public Account(String email,String passwordHash,String displayName){this.email=email;this.passwordHash=passwordHash;this.displayName=displayName;}
 public UUID getId(){return id;}public String getEmail(){return email;}public String getPasswordHash(){return passwordHash;}public String getDisplayName(){return displayName;}public String getRole(){return role;}
 public String getFavoriteGenres(){return favoriteGenres;}public String getFavoriteMoods(){return favoriteMoods;}public String getPreferredLanguages(){return preferredLanguages;}
 public Instant getCreatedAt(){return createdAt;}
 public void updateProfile(String displayName,String genres,String moods,String languages){this.displayName=displayName;this.favoriteGenres=genres;this.favoriteMoods=moods;this.preferredLanguages=languages;}
 public void setRole(String role){this.role=role;}
}