package com.spendwise.api.repository;
import com.spendwise.api.model.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction,Long> { List<CreditTransaction> findAllByCardIdOrderByDateDesc(Long cardId); }
