package com.spendwise.api.repository;
import com.spendwise.api.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface NotificationRepository extends JpaRepository<AppNotification,Long> { List<AppNotification> findAllByUserIdOrderByCreatedAtDesc(Long userId); Optional<AppNotification> findByIdAndUserId(Long id,Long userId); }
