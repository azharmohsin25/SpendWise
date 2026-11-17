package com.spendwise.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="password_reset_tokens",indexes=@Index(name="idx_reset_token_hash",columnList="token_hash",unique=true))
public class PasswordResetToken {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private AppUser user;
    @Column(name="token_hash",nullable=false,length=64,unique=true) private String tokenHash;
    @Column(name="expires_at",nullable=false) private Instant expiresAt;
    protected PasswordResetToken() {}
    public PasswordResetToken(AppUser user,String tokenHash,Instant expiresAt){this.user=user;this.tokenHash=tokenHash;this.expiresAt=expiresAt;}
    public Long getId(){return id;} public AppUser getUser(){return user;} public Instant getExpiresAt(){return expiresAt;}
}
