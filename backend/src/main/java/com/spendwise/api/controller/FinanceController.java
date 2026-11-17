package com.spendwise.api.controller;

import com.spendwise.api.dto.FinanceDtos;
import com.spendwise.api.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api")
public class FinanceController {
    private final FinanceService finance;
    public FinanceController(FinanceService finance){this.finance=finance;}
    private String email(Authentication auth){return auth.getName();}
    @GetMapping("/dashboard") public FinanceDtos.DashboardView dashboard(Authentication auth){return finance.dashboard(email(auth));}
    @GetMapping("/profile") public FinanceDtos.ProfileView profile(Authentication auth){return finance.getProfile(email(auth));}
    @PutMapping("/profile") public FinanceDtos.ProfileView updateProfile(Authentication auth,@Valid @RequestBody FinanceDtos.ProfileRequest body){return finance.updateProfile(email(auth),body);}
    @GetMapping("/incomes") public List<FinanceDtos.IncomeView> incomes(Authentication auth){return finance.incomes(email(auth));}
    @PostMapping("/incomes") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.IncomeView addIncome(Authentication auth,@Valid @RequestBody FinanceDtos.IncomeRequest body){return finance.addIncome(email(auth),body);}
    @GetMapping("/expenses") public List<FinanceDtos.ExpenseView> expenses(Authentication auth){return finance.expenses(email(auth));}
    @PostMapping("/expenses") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.ExpenseView addExpense(Authentication auth,@Valid @RequestBody FinanceDtos.ExpenseRequest body){return finance.addExpense(email(auth),body);}
    @PutMapping("/expenses/{id}") public FinanceDtos.ExpenseView updateExpense(Authentication auth,@PathVariable Long id,@Valid @RequestBody FinanceDtos.ExpenseRequest body){return finance.updateExpense(email(auth),id,body);}
    @DeleteMapping("/expenses/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteExpense(Authentication auth,@PathVariable Long id){finance.deleteExpense(email(auth),id);}
    @GetMapping("/goals") public List<FinanceDtos.GoalView> goals(Authentication auth){return finance.goals(email(auth));}
    @PostMapping("/goals") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.GoalView addGoal(Authentication auth,@Valid @RequestBody FinanceDtos.GoalRequest body){return finance.addGoal(email(auth),body);}
    @PutMapping("/goals/{id}") public FinanceDtos.GoalView updateGoal(Authentication auth,@PathVariable Long id,@Valid @RequestBody FinanceDtos.GoalRequest body){return finance.updateGoal(email(auth),id,body);}
    @DeleteMapping("/goals/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteGoal(Authentication auth,@PathVariable Long id){finance.deleteGoal(email(auth),id);}
    @GetMapping("/cards") public List<FinanceDtos.CardView> cards(Authentication auth){return finance.cards(email(auth));}
    @PostMapping("/cards") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.CardView addCard(Authentication auth,@Valid @RequestBody FinanceDtos.CardRequest body){return finance.addCard(email(auth),body);}
    @GetMapping("/emis") public List<FinanceDtos.EmiView> emis(Authentication auth){return finance.emis(email(auth));}
    @PostMapping("/emis") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.EmiView addEmi(Authentication auth,@Valid @RequestBody FinanceDtos.EmiRequest body){return finance.addEmi(email(auth),body);}
    @PostMapping("/emi/calculate") public FinanceDtos.EmiCalculationResponse calculateEmi(Authentication auth,@Valid @RequestBody FinanceDtos.EmiCalculationRequest body){return finance.calculateEmi(body);}
    @PostMapping("/purchase/assess") public FinanceDtos.PurchaseResponse assess(Authentication auth,@Valid @RequestBody FinanceDtos.PurchaseRequest body){return finance.assess(body);}
    @GetMapping("/simulations") public List<FinanceDtos.SimulationView> simulations(Authentication auth){return finance.simulations(email(auth));}
    @PostMapping("/simulations") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.SimulationView saveSimulation(Authentication auth,@Valid @RequestBody FinanceDtos.PurchaseRequest body){return finance.saveSimulation(email(auth),body);}
    @GetMapping("/categories") public List<FinanceDtos.CategoryView> categories(Authentication auth){return finance.categories(email(auth));}
    @PostMapping("/categories") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.CategoryView addCategory(Authentication auth,@Valid @RequestBody FinanceDtos.CategoryRequest body){return finance.addCategory(email(auth),body);}
    @GetMapping("/budgets") public List<FinanceDtos.BudgetView> budgets(Authentication auth,@RequestParam(required=false) Integer year,@RequestParam(required=false) Integer month){return finance.budgets(email(auth),year,month);}
    @PostMapping("/budgets") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.BudgetView addBudget(Authentication auth,@Valid @RequestBody FinanceDtos.BudgetRequest body){return finance.addBudget(email(auth),body);}
    @GetMapping("/cards/{id}/transactions") public List<FinanceDtos.CardTransactionView> cardTransactions(Authentication auth,@PathVariable Long id){return finance.cardTransactions(email(auth),id);}
    @PostMapping("/cards/{id}/transactions") @ResponseStatus(HttpStatus.CREATED) public FinanceDtos.CardTransactionView addCardTransaction(Authentication auth,@PathVariable Long id,@Valid @RequestBody FinanceDtos.CardTransactionRequest body){return finance.addCardTransaction(email(auth),id,body);}
    @GetMapping("/notifications") public List<FinanceDtos.NotificationView> notifications(Authentication auth){return finance.notifications(email(auth));}
    @PatchMapping("/notifications/{id}/read") public FinanceDtos.NotificationView markNotificationRead(Authentication auth,@PathVariable Long id){return finance.markNotificationRead(email(auth),id);}
}
