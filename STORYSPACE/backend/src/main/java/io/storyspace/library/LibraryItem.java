package io.storyspace.library;
import io.storyspace.accounts.Account;import io.storyspace.catalog.Title;import jakarta.persistence.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="user_library",uniqueConstraints=@UniqueConstraint(columnNames={"account_id","title_id"}))
public class LibraryItem {
 @Id @GeneratedValue private UUID id;@ManyToOne(optional=false) private Account account;@ManyToOne(optional=false) private Title title;
 @Column(nullable=false) private String state="WATCHLIST";private int progressPercent=0;private Integer userRating;private Instant updatedAt=Instant.now();
 protected LibraryItem(){}
 public LibraryItem(Account account,Title title){this.account=account;this.title=title;}
 public UUID getId(){return id;}public Account getAccount(){return account;}public Title getTitle(){return title;}public String getState(){return state;}public int getProgressPercent(){return progressPercent;}public Integer getUserRating(){return userRating;}public Instant getUpdatedAt(){return updatedAt;}
 public void setState(String state){this.state=state;this.updatedAt=Instant.now();}public void setProgressPercent(int p){this.progressPercent=Math.max(0,Math.min(100,p));this.state=p>=100?"COMPLETED":"IN_PROGRESS";this.updatedAt=Instant.now();}public void setUserRating(Integer rating){this.userRating=rating;this.updatedAt=Instant.now();}
}