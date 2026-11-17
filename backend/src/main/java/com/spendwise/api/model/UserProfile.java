package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "user_profiles")
public class UserProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false, unique = true) private AppUser user;
    @Column(name = "available_balance", nullable = false, precision = 14, scale = 2) private BigDecimal availableBalance = BigDecimal.ZERO;
    @Column(name = "monthly_salary", nullable = false, precision = 14, scale = 2) private BigDecimal monthlySalary = BigDecimal.ZERO;
    @Column(name = "essential_expenses", nullable = false, precision = 14, scale = 2) private BigDecimal essentialExpenses = BigDecimal.ZERO;
    @Column(name = "emergency_savings", nullable = false, precision = 14, scale = 2) private BigDecimal emergencySavings = BigDecimal.ZERO;
    @Column(name = "credit_obligations", nullable = false, precision = 14, scale = 2) private BigDecimal creditObligations = BigDecimal.ZERO;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
    protected UserProfile() {}
    public UserProfile(AppUser user) { this.user = user; }
    public void update(BigDecimal availableBalance, BigDecimal monthlySalary, BigDecimal essentialExpenses, BigDecimal emergencySavings, BigDecimal creditObligations) {
        this.availableBalance=availableBalance; this.monthlySalary=monthlySalary; this.essentialExpenses=essentialExpenses; this.emergencySavings=emergencySavings; this.creditObligations=creditObligations; this.updatedAt=Instant.now();
    }
    public Long getId(){return id;} public AppUser getUser(){return user;} public BigDecimal getAvailableBalance(){return availableBalance;} public BigDecimal getMonthlySalary(){return monthlySalary;} public BigDecimal getEssentialExpenses(){return essentialExpenses;} public BigDecimal getEmergencySavings(){return emergencySavings;} public BigDecimal getCreditObligations(){return creditObligations;} public Instant getUpdatedAt(){return updatedAt;}
}
