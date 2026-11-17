package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "expenses", indexes = @Index(name = "idx_expense_user_date", columnList = "user_id,expense_date"))
public class Expense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
    @Column(nullable = false, length = 120) private String description;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="category_id", nullable=false) private ExpenseCategory category;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal amount;
    @Column(name = "expense_date", nullable = false) private LocalDate date;
    protected Expense() {}
    public Expense(AppUser user, String description, ExpenseCategory category, BigDecimal amount, LocalDate date) { this.user=user; this.description=description; this.category=category; this.amount=amount; this.date=date; }
    public void update(String description,ExpenseCategory category,BigDecimal amount,LocalDate date){this.description=description;this.category=category;this.amount=amount;this.date=date;}
    public Long getId(){return id;} public AppUser getUser(){return user;} public String getDescription(){return description;} public String getCategory(){return category.getName();} public BigDecimal getAmount(){return amount;} public LocalDate getDate(){return date;}
}
