package com.spendwise.api.repository;
import com.spendwise.api.model.EmiRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface EmiRecordRepository extends JpaRepository<EmiRecord,Long> {
    List<EmiRecord> findAllByUserIdOrderByNextPaymentDateAsc(Long userId);
    @Query("select coalesce(sum(e.monthlyPayment),0) from EmiRecord e where e.user.id=:userId") BigDecimal sumMonthlyPayments(@Param("userId") Long userId);
}
