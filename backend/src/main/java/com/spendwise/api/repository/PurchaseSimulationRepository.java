package com.spendwise.api.repository;
import com.spendwise.api.model.PurchaseSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PurchaseSimulationRepository extends JpaRepository<PurchaseSimulation,Long> { List<PurchaseSimulation> findAllByUserIdOrderByCreatedAtDesc(Long userId); }
