package com.spendwise.api.service;

import com.spendwise.api.dto.FinanceDtos;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class FinanceServiceTest {
    private FinanceService service;

    @BeforeEach void setUp() {
        service = new FinanceService(null,null,null,null,null,null,null,null,null,null,null,null);
    }

    @Test void zeroInterestEmiDividesFinancedPrincipalAcrossPayments() {
        var result=service.calculateEmi(new FinanceDtos.EmiCalculationRequest(new BigDecimal("1200"),new BigDecimal("200"),BigDecimal.ZERO,10));
        assertEquals(new BigDecimal("1000"),result.financedPrincipal());
        assertEquals(new BigDecimal("100.00"),result.monthlyPayment());
        assertEquals(new BigDecimal("0.00"),result.totalInterest());
        assertEquals(new BigDecimal("1000.00"),result.totalRepayment());
    }

    @Test void positiveInterestEmiUsesReducingBalanceFormula() {
        var result=service.calculateEmi(new FinanceDtos.EmiCalculationRequest(new BigDecimal("1000"),BigDecimal.ZERO,new BigDecimal("12"),12));
        assertEquals(new BigDecimal("88.85"),result.monthlyPayment());
        assertEquals(new BigDecimal("66.20"),result.totalInterest());
    }

    @Test void purchaseAssessmentKeepsDedicatedEmergencySavingsInTheReserve() {
        var result=service.assess(new FinanceDtos.PurchaseRequest("Phone",new BigDecimal("1000"),new BigDecimal("3000"),new BigDecimal("6000"),new BigDecimal("5000"),new BigDecimal("1000"),new BigDecimal("500"),new BigDecimal("300"),0));
        assertEquals("Affordable",result.recommendation());
        assertEquals(100,result.score());
        assertEquals(new BigDecimal("8.0"),result.monthsOfExpenseCover());
    }
}
