package com.spendwise.api.repository;
import com.spendwise.api.model.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory,Long> { List<ExpenseCategory> findAllByUserIdOrderByNameAsc(Long userId); Optional<ExpenseCategory> findByIdAndUserId(Long id,Long userId); Optional<ExpenseCategory> findByUserIdAndNameIgnoreCase(Long userId,String name); }
