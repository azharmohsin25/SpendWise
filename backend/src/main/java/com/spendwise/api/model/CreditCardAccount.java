package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "credit_cards", indexes = @Index(name = "idx_card_user", columnList = "user_id"))
public class CreditCardAccount {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
    @Column(nullable = false, length = 90) private String name;
    @Column(name = "last_four", nullable = false, length = 4) private String lastFour;
    @Column(name = "credit_limit", nullable = false, precision = 14, scale = 2) private BigDecimal creditLimit;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal outstanding;
    @Column(name = "due_date") private LocalDate dueDate;
    protected CreditCardAccount() {}
    public CreditCardAccount(AppUser user,String name,String lastFour,BigDecimal creditLimit,BigDecimal outstanding,LocalDate dueDate){this.user=user;this.name=name;this.lastFour=lastFour;this.creditLimit=creditLimit;this.outstanding=outstanding;this.dueDate=dueDate;}
    public void addOutstanding(BigDecimal amount){this.outstanding=this.outstanding.add(amount);}
    public Long getId(){return id;} public AppUser getUser(){return user;} public String getName(){return name;} public String getLastFour(){return lastFour;} public BigDecimal getCreditLimit(){return creditLimit;} public BigDecimal getOutstanding(){return outstanding;} public LocalDate getDueDate(){return dueDate;}
}
