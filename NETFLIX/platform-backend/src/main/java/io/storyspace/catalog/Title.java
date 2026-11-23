package io.storyspace.catalog;
import jakarta.persistence.*;import java.util.UUID;
@Entity @Table(name="catalog_titles")
public class Title {
 @Id @GeneratedValue private UUID id;
 @Column(nullable=false,unique=true) private String slug;
 @Column(nullable=false,length=160) private String name;
 @Column(nullable=false,length=2500) private String synopsis;
 @Column(nullable=false,length=500) private String genres="";
 @Column(nullable=false,length=500) private String moods="";
 @Column(nullable=false,length=60) private String language="English";
 private int releaseYear;private String ageRating="13+";private String format="FILM";private double communityScore=7.5;
 @Column(length=1000) private String posterUrl="";@Column(length=1000) private String backdropUrl="";
 private boolean featured=false;private boolean original=false;private boolean published=true;
 protected Title(){}
 public Title(String slug,String name,String synopsis,String genres,String moods,String language,int releaseYear,String ageRating,String format,double score,String poster,String backdrop,boolean featured,boolean original){
  this.slug=slug;this.name=name;this.synopsis=synopsis;this.genres=genres;this.moods=moods;this.language=language;this.releaseYear=releaseYear;this.ageRating=ageRating;this.format=format;this.communityScore=score;this.posterUrl=poster;this.backdropUrl=backdrop;this.featured=featured;this.original=original;
 }
 public UUID getId(){return id;}public String getSlug(){return slug;}public String getName(){return name;}public String getSynopsis(){return synopsis;}public String getGenres(){return genres;}public String getMoods(){return moods;}public String getLanguage(){return language;}public int getReleaseYear(){return releaseYear;}public String getAgeRating(){return ageRating;}public String getFormat(){return format;}public double getCommunityScore(){return communityScore;}public String getPosterUrl(){return posterUrl;}public String getBackdropUrl(){return backdropUrl;}public boolean isFeatured(){return featured;}public boolean isOriginal(){return original;}public boolean isPublished(){return published;}
}