package io.storyspace.library;
import io.storyspace.accounts.Account;import io.storyspace.catalog.Title;import jakarta.persistence.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="user_library",uniqueConstraints=@UniqueConstraint(columnNames={"account_id","title_id"}))
public class LibraryItem {
 @Id @GeneratedValue private UUID id;@ManyToOne(optional=false) private Account account;@ManyToOne(optional=false) private Title title;
 @Column(nullable=false) private String state="WATCHLIST";private int progressPercent=0;private Integer userRating;private Instant updatedAt=Instant.now();
 @Column(name="resume_position_seconds",nullable=false) private double resumePositionSeconds=0;
 @Column(name="duration_seconds",nullable=false) private double durationSeconds=0;
 @Column(name="last_played_at") private Instant lastPlayedAt;
 protected LibraryItem(){}
 public LibraryItem(Account account,Title title){this.account=account;this.title=title;}
 public UUID getId(){return id;}public Account getAccount(){return account;}public Title getTitle(){return title;}public String getState(){return state;}public int getProgressPercent(){return progressPercent;}public Integer getUserRating(){return userRating;}public Instant getUpdatedAt(){return updatedAt;}public void setUpdatedAt(Instant value){if(value!=null)this.updatedAt=value;}
 public double getResumePositionSeconds(){return resumePositionSeconds;}public double getDurationSeconds(){return durationSeconds;}public Instant getLastPlayedAt(){return lastPlayedAt;}
 public void setState(String state){this.state=state;this.updatedAt=Instant.now();}
 public void setProgressPercent(int p){this.progressPercent=Math.max(0,Math.min(100,p));this.state=p>=100?"COMPLETED":p>0?"IN_PROGRESS":"WATCHLIST";this.updatedAt=Instant.now();}
 public void setPlaybackPosition(double currentTime,double duration){
  if(!Double.isFinite(currentTime)||!Double.isFinite(duration)||duration<=0||duration>86400||currentTime<0)throw new IllegalArgumentException("Playback position or duration is invalid");
  this.durationSeconds=duration;
  if(currentTime>=duration-3){this.resumePositionSeconds=0;this.progressPercent=100;this.state="COMPLETED";}
  else{this.resumePositionSeconds=Math.min(currentTime,duration);this.progressPercent=(int)Math.max(0,Math.min(99,Math.round(this.resumePositionSeconds/duration*100)));this.state=this.progressPercent>0?"IN_PROGRESS":"WATCHLIST";}
  this.lastPlayedAt=Instant.now();this.updatedAt=this.lastPlayedAt;
 }
 public void setUserRating(Integer rating){this.userRating=rating;this.updatedAt=Instant.now();}
}