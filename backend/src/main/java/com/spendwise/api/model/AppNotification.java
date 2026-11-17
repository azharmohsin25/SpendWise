package com.spendwise.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="notifications",indexes=@Index(name="idx_notification_user_created",columnList="user_id,created_at"))
public class AppNotification {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private AppUser user;
    @Column(nullable=false,length=120) private String title;
    @Column(nullable=false,length=500) private String message;
    @Column(name="is_read",nullable=false) private boolean read=false;
    @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
    protected AppNotification() {}
    public AppNotification(AppUser user,String title,String message){this.user=user;this.title=title;this.message=message;}
    public Long getId(){return id;} public String getTitle(){return title;} public String getMessage(){return message;} public boolean isRead(){return read;} public Instant getCreatedAt(){return createdAt;} public void markRead(){read=true;}
}
