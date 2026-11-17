package com.spendwise.api.model;

import jakarta.persistence.*;

@Entity @Table(name="expense_categories",uniqueConstraints=@UniqueConstraint(name="uq_category_user_name",columnNames={"user_id","name"}))
public class ExpenseCategory {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private AppUser user;
    @Column(nullable=false,length=70) private String name;
    @Column(nullable=false,length=7) private String color="#10B981";
    protected ExpenseCategory() {}
    public ExpenseCategory(AppUser user,String name,String color){this.user=user;this.name=name;this.color=color;}
    public Long getId(){return id;} public String getName(){return name;} public String getColor(){return color;}
}
