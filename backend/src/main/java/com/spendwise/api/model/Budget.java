package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.YearMonth;

@Entity @Table(name="budgets",uniqueConstraints=@UniqueConstraint(name="uq_budget_user_category_month",columnNames={"user_id","category_id","budget_year","budget_month"}))
public class Budget {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private AppUser user;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="category_id",nullable=false) private ExpenseCategory category;
    @Column(name="budget_year",nullable=false) private Integer year;
    @Column(name="budget_month",nullable=false) private Integer month;
    @Column(name="limit_amount",nullable=false,precision=14,scale=2) private BigDecimal limitAmount;
    protected Budget() {}
    public Budget(AppUser user,ExpenseCategory category,YearMonth period,BigDecimal limitAmount){this.user=user;this.category=category;this.year=period.getYear();this.month=period.getMonthValue();this.limitAmount=limitAmount;}
    public void updateLimitAmount(BigDecimal limitAmount){this.limitAmount=limitAmount;}
    public Long getId(){return id;} public Long getCategoryId(){return category.getId();} public String getCategoryName(){return category.getName();} public Integer getYear(){return year;} public Integer getMonth(){return month;} public BigDecimal getLimitAmount(){return limitAmount;}
}
