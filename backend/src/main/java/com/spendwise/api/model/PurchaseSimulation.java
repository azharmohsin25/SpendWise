package com.spendwise.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "purchase_simulations", indexes = @Index(name = "idx_simulation_user_time", columnList = "user_id,created_at"))
public class PurchaseSimulation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
    @Column(nullable = false, length = 140) private String product;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal price;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal projectedCash;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal cashAfterPurchase;
    @Column(nullable = false) private Integer score;
    @Column(nullable = false, length = 30) private String recommendation;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    protected PurchaseSimulation() {}
    public PurchaseSimulation(AppUser user,String product,BigDecimal price,BigDecimal projectedCash,BigDecimal cashAfterPurchase,Integer score,String recommendation){this.user=user;this.product=product;this.price=price;this.projectedCash=projectedCash;this.cashAfterPurchase=cashAfterPurchase;this.score=score;this.recommendation=recommendation;}
    public Long getId(){return id;} public String getProduct(){return product;} public BigDecimal getPrice(){return price;} public BigDecimal getProjectedCash(){return projectedCash;} public BigDecimal getCashAfterPurchase(){return cashAfterPurchase;} public Integer getScore(){return score;} public String getRecommendation(){return recommendation;} public Instant getCreatedAt(){return createdAt;}
}
