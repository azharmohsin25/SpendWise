package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "financial_goals", indexes = @Index(name = "idx_goal_user", columnList = "user_id"))
public class SavingsGoal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
    @Column(nullable = false, length = 120) private String name;
    @Column(name = "target_amount", nullable = false, precision = 14, scale = 2) private BigDecimal targetAmount;
    @Column(name = "saved_amount", nullable = false, precision = 14, scale = 2) private BigDecimal savedAmount;
    @Column(name = "target_date") private LocalDate targetDate;
    protected SavingsGoal() {}
    public SavingsGoal(AppUser user,String name,BigDecimal targetAmount,BigDecimal savedAmount,LocalDate targetDate){this.user=user;this.name=name;this.targetAmount=targetAmount;this.savedAmount=savedAmount;this.targetDate=targetDate;}
    public void update(String name,BigDecimal targetAmount,BigDecimal savedAmount,LocalDate targetDate){this.name=name;this.targetAmount=targetAmount;this.savedAmount=savedAmount;this.targetDate=targetDate;}
    public Long getId(){return id;} public AppUser getUser(){return user;} public String getName(){return name;} public BigDecimal getTargetAmount(){return targetAmount;} public BigDecimal getSavedAmount(){return savedAmount;} public LocalDate getTargetDate(){return targetDate;}
}
