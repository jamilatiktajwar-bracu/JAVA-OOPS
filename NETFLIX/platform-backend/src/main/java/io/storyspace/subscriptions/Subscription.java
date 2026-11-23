package io.storyspace.subscriptions;
import io.storyspace.accounts.Account;import jakarta.persistence.*;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="subscriptions") public class Subscription {
 @Id @GeneratedValue private UUID id;@ManyToOne(optional=false)private Account account;
 @Column(nullable=false)private String planKey;@Column(nullable=false)private String status="ACTIVE";@Column(nullable=false)private Instant startedAt=Instant.now();private Instant endsAt;private Instant cancelledAt;
 protected Subscription(){}public Subscription(Account account,String planKey,Instant end){this.account=account;this.planKey=planKey;this.endsAt=end;}
 public UUID getId(){return id;}public Account getAccount(){return account;}public String getPlanKey(){return planKey;}public String getStatus(){return status;}public Instant getStartedAt(){return startedAt;}public Instant getEndsAt(){return endsAt;}public Instant getCancelledAt(){return cancelledAt;}
 public void cancel(){status="CANCELLED";cancelledAt=Instant.now();}
}