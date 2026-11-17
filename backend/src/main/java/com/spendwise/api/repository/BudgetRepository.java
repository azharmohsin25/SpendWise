package com.spendwise.api.repository;
import com.spendwise.api.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BudgetRepository extends JpaRepository<Budget,Long> { List<Budget> findAllByUserIdAndYearAndMonthOrderByIdAsc(Long userId,Integer year,Integer month); }
