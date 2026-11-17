package com.spendwise.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users", indexes = @Index(name = "idx_users_email", columnList = "email", unique = true))
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 90)
    private String fullName;
    @Column(nullable = false, unique = true, length = 190)
    private String email;
    @Column(nullable = false, length = 100)
    private String passwordHash;
    @Column(nullable = false, length = 3)
    private String currency = "INR";
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected AppUser() {}
    public AppUser(String fullName, String email, String passwordHash) {
        this.fullName = fullName;
        this.email = email.toLowerCase().trim();
        this.passwordHash = passwordHash;
    }
    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getCurrency() { return currency; }
    public Instant getCreatedAt() { return createdAt; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setCurrency(String currency) { this.currency = currency; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
