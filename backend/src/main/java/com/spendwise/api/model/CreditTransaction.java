package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name="credit_transactions",indexes=@Index(name="idx_credit_transaction_card_date",columnList="card_id,transaction_date"))
public class CreditTransaction {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="card_id",nullable=false) private CreditCardAccount card;
    @Column(nullable=false,length=140) private String description;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal amount;
    @Column(name="transaction_date",nullable=false) private LocalDate date;
    protected CreditTransaction() {}
    public CreditTransaction(CreditCardAccount card,String description,BigDecimal amount,LocalDate date){this.card=card;this.description=description;this.amount=amount;this.date=date;}
    public Long getId(){return id;} public Long getCardId(){return card.getId();} public String getDescription(){return description;} public BigDecimal getAmount(){return amount;} public LocalDate getDate(){return date;}
}
