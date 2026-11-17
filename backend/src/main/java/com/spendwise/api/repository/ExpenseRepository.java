package com.spendwise.api.repository;
import com.spendwise.api.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface ExpenseRepository extends JpaRepository<Expense,Long> {
    List<Expense> findAllByUserIdOrderByDateDesc(Long userId);
    long countByUserId(Long userId);
    Optional<Expense> findByIdAndUserId(Long id,Long userId);
    @Query("select coalesce(sum(e.amount),0) from Expense e where e.user.id=:userId and e.date between :start and :end") BigDecimal sumForPeriod(@Param("userId") Long userId,@Param("start") LocalDate start,@Param("end") LocalDate end);
    @Query("select e.category.name, sum(e.amount) from Expense e where e.user.id=:userId and e.date between :start and :end group by e.category.name order by sum(e.amount) desc") List<Object[]> categoryTotals(@Param("userId") Long userId,@Param("start") LocalDate start,@Param("end") LocalDate end);
}
