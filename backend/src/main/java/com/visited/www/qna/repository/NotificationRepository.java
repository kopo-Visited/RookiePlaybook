package com.visited.www.qna.repository;

import com.visited.www.qna.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findAllByUserId(Long userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    void deleteAllByUserId(Long userId);
}
