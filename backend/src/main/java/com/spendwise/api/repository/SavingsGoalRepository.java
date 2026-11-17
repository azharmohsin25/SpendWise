package com.spendwise.api.repository;
import com.spendwise.api.model.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal,Long> {
    List<SavingsGoal> findAllByUserIdOrderByIdDesc(Long userId);
    Optional<SavingsGoal> findByIdAndUserId(Long id,Long userId);
}
