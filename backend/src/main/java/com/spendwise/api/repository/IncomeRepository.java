package com.spendwise.api.repository;
import com.spendwise.api.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface IncomeRepository extends JpaRepository<Income,Long> {
    List<Income> findAllByUserIdOrderByDateDesc(Long userId);
    long countByUserId(Long userId);
    @Query("select coalesce(sum(i.amount),0) from Income i where i.user.id=:userId and i.date between :start and :end") BigDecimal sumForPeriod(@Param("userId") Long userId,@Param("start") LocalDate start,@Param("end") LocalDate end);
}
