package com.spendwise.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class FinanceDtos {
    private FinanceDtos() {}
    public record ProfileRequest(@NotNull @DecimalMin("0.00") BigDecimal availableBalance, @NotNull @DecimalMin("0.00") BigDecimal monthlySalary, @NotNull @DecimalMin("0.00") BigDecimal essentialExpenses, @NotNull @DecimalMin("0.00") BigDecimal emergencySavings, @NotNull @DecimalMin("0.00") BigDecimal creditObligations) {}
    public record ProfileView(BigDecimal availableBalance,BigDecimal monthlySalary,BigDecimal essentialExpenses,BigDecimal emergencySavings,BigDecimal creditObligations,Instant updatedAt) {}
    public record IncomeRequest(@NotBlank @Size(max=100) String source,@NotNull @DecimalMin(value="0.01") BigDecimal amount,@NotNull LocalDate date,@Size(max=300) String note) {}
    public record IncomeView(Long id,String source,BigDecimal amount,LocalDate date,String note) {}
    public record ExpenseRequest(@NotBlank @Size(max=120) String description,@NotBlank @Size(max=70) String category,@NotNull @DecimalMin(value="0.01") BigDecimal amount,@NotNull LocalDate date) {}
    public record ExpenseView(Long id,String description,String category,BigDecimal amount,LocalDate date) {}
    public record GoalRequest(@NotBlank @Size(max=120) String name,@NotNull @DecimalMin(value="0.01") BigDecimal targetAmount,@NotNull @DecimalMin("0.00") BigDecimal savedAmount,LocalDate targetDate) {}
    public record GoalView(Long id,String name,BigDecimal targetAmount,BigDecimal savedAmount,LocalDate targetDate) {}
    public record CardRequest(@NotBlank @Size(max=90) String name,@NotBlank @Pattern(regexp="\\d{4}") String lastFour,@NotNull @DecimalMin(value="0.01") BigDecimal creditLimit,@NotNull @DecimalMin("0.00") BigDecimal outstanding,LocalDate dueDate) {}
    public record CardView(Long id,String name,String lastFour,BigDecimal creditLimit,BigDecimal outstanding,BigDecimal availableCredit,BigDecimal utilization,LocalDate dueDate) {}
    public record EmiRequest(@NotBlank @Size(max=120) String label,@NotNull @DecimalMin(value="0.01") BigDecimal principal,@NotNull @DecimalMin("0.00") BigDecimal downPayment,@NotNull @DecimalMin("0.00") BigDecimal annualRate,@NotNull @Min(1) @Max(600) Integer termMonths,LocalDate nextPaymentDate) {}
    public record EmiCalculationRequest(@NotNull @DecimalMin("0.00") BigDecimal principal,@NotNull @DecimalMin("0.00") BigDecimal downPayment,@NotNull @DecimalMin("0.00") BigDecimal annualRate,@NotNull @Min(1) @Max(600) Integer termMonths) {}
    public record EmiView(Long id,String label,BigDecimal principal,BigDecimal downPayment,BigDecimal annualRate,Integer termMonths,BigDecimal monthlyPayment,LocalDate nextPaymentDate) {}
    public record EmiCalculationResponse(BigDecimal financedPrincipal,BigDecimal monthlyPayment,BigDecimal totalInterest,BigDecimal totalRepayment,Integer termMonths) {}
    public record PurchaseRequest(@NotBlank @Size(max=140) String product,@NotNull @DecimalMin("0.00") BigDecimal price,@NotNull @DecimalMin("0.00") BigDecimal currentBalance,@NotNull @DecimalMin("0.00") BigDecimal emergencySavings,@NotNull @DecimalMin("0.00") BigDecimal monthlyIncome,@NotNull @DecimalMin("0.00") BigDecimal monthlyExpenses,@NotNull @DecimalMin("0.00") BigDecimal existingEmi,@NotNull @DecimalMin("0.00") BigDecimal creditObligations,@Min(0) @Max(24) int monthsUntil) {}
    public record PurchaseResponse(BigDecimal monthlySurplus,BigDecimal projectedCash,BigDecimal cashAfterPurchase,BigDecimal emergencyTarget,BigDecimal monthsOfExpenseCover,Integer recoveryMonths,Integer score,String recommendation,String explanation) {}
    public record SimulationView(Long id,String product,BigDecimal price,BigDecimal projectedCash,BigDecimal cashAfterPurchase,Integer score,String recommendation,Instant createdAt) {}
    public record TrendPoint(String month,BigDecimal income,BigDecimal expenses,BigDecimal savings) {}
    public record CategorySpend(String name,BigDecimal amount,String color) {}
    public record DashboardView(ProfileView profile,BigDecimal monthIncome,BigDecimal monthExpenses,BigDecimal monthlySavings,BigDecimal savingsRate,BigDecimal totalMonthlyEmi,BigDecimal cardOutstanding,long incomeEntries,long expenseEntries,List<TrendPoint> monthlyTrend,List<CategorySpend> expenseBreakdown) {}
    public record CategoryRequest(@NotBlank @Size(max=70) String name,@Pattern(regexp="#[0-9A-Fa-f]{6}") String color) {}
    public record CategoryView(Long id,String name,String color) {}
    public record BudgetRequest(@NotNull Long categoryId,@NotNull @Min(2000) Integer year,@NotNull @Min(1) @Max(12) Integer month,@NotNull @DecimalMin(value="0.01") BigDecimal limitAmount) {}
    public record BudgetView(Long id,Long categoryId,String category, Integer year,Integer month,BigDecimal limitAmount) {}
    public record CardTransactionRequest(@NotBlank @Size(max=140) String description,@NotNull @DecimalMin(value="0.01") BigDecimal amount,@NotNull LocalDate date) {}
    public record CardTransactionView(Long id,Long cardId,String description,BigDecimal amount,LocalDate date) {}
    public record NotificationView(Long id,String title,String message,boolean read,Instant createdAt) {}
}
