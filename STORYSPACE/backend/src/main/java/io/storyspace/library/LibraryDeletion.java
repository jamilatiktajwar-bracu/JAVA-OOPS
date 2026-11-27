package io.storyspace.library;
import io.storyspace.accounts.Account;import io.storyspace.catalog.Title;import jakarta.persistence.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="user_library_deletions",uniqueConstraints=@UniqueConstraint(columnNames={"account_id","title_id"}))
public class LibraryDeletion {
 @Id @GeneratedValue private UUID id;
 @ManyToOne(optional=false) @JoinColumn(name="account_id",nullable=false) private Account account;
 @ManyToOne(optional=false) @JoinColumn(name="title_id",nullable=false) private Title title;
 @Column(nullable=false) private Instant updatedAt=Instant.now();
 protected LibraryDeletion(){}
 public LibraryDeletion(Account account,Title title,Instant updatedAt){this.account=account;this.title=title;this.updatedAt=updatedAt==null?Instant.now():updatedAt;}
 public Title getTitle(){return title;}public Instant getUpdatedAt(){return updatedAt;}
 public void setUpdatedAt(Instant value){updatedAt=value;}
}
