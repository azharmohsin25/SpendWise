package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "emi_records", indexes = @Index(name = "idx_emi_user_due", columnList = "user_id,next_payment_date"))
public class EmiRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
    @Column(nullable = false, length = 120) private String label;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal principal;
    @Column(name = "down_payment", nullable = false, precision = 14, scale = 2) private BigDecimal downPayment;
    @Column(name = "annual_rate", nullable = false, precision = 6, scale = 3) private BigDecimal annualRate;
    @Column(name = "term_months", nullable = false) private Integer termMonths;
    @Column(name = "monthly_payment", nullable = false, precision = 14, scale = 2) private BigDecimal monthlyPayment;
    @Column(name = "next_payment_date") private LocalDate nextPaymentDate;
    protected EmiRecord() {}
    public EmiRecord(AppUser user,String label,BigDecimal principal,BigDecimal downPayment,BigDecimal annualRate,Integer termMonths,BigDecimal monthlyPayment,LocalDate nextPaymentDate){this.user=user;this.label=label;this.principal=principal;this.downPayment=downPayment;this.annualRate=annualRate;this.termMonths=termMonths;this.monthlyPayment=monthlyPayment;this.nextPaymentDate=nextPaymentDate;}
    public Long getId(){return id;} public AppUser getUser(){return user;} public String getLabel(){return label;} public BigDecimal getPrincipal(){return principal;} public BigDecimal getDownPayment(){return downPayment;} public BigDecimal getAnnualRate(){return annualRate;} public Integer getTermMonths(){return termMonths;} public BigDecimal getMonthlyPayment(){return monthlyPayment;} public LocalDate getNextPaymentDate(){return nextPaymentDate;}
}
