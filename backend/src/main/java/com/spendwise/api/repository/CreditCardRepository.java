package com.spendwise.api.repository;
import com.spendwise.api.model.CreditCardAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface CreditCardRepository extends JpaRepository<CreditCardAccount,Long> {
    List<CreditCardAccount> findAllByUserIdOrderByIdDesc(Long userId);
    Optional<CreditCardAccount> findByIdAndUserId(Long id,Long userId);
    @Query("select coalesce(sum(c.outstanding),0) from CreditCardAccount c where c.user.id=:userId") BigDecimal sumOutstanding(@Param("userId") Long userId);
}
