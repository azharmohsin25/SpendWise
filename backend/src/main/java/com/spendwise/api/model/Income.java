package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "income", indexes = @Index(name = "idx_income_user_date", columnList = "user_id,income_date"))
public class Income {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
    @Column(nullable = false, length = 100) private String source;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal amount;
    @Column(name = "income_date", nullable = false) private LocalDate date;
    @Column(length = 300) private String note;
    protected Income() {}
    public Income(AppUser user, String source, BigDecimal amount, LocalDate date, String note) { this.user=user; this.source=source; this.amount=amount; this.date=date; this.note=note; }
    public Long getId(){return id;} public AppUser getUser(){return user;} public String getSource(){return source;} public BigDecimal getAmount(){return amount;} public LocalDate getDate(){return date;} public String getNote(){return note;}
}
