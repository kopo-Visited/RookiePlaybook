package com.visited.www.qna.service;

import com.visited.www.qna.dto.response.NotificationListResponseDto;
import com.visited.www.qna.dto.response.NotificationReadResponseDto;
import com.visited.www.qna.dto.response.NotificationResponseDto;
import com.visited.www.qna.entity.Notification;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.NotificationType;
import com.visited.www.qna.exception.NotificationNotFoundException;
import com.visited.www.qna.exception.QuestionAccessDeniedException;
import com.visited.www.qna.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationListResponseDto getMyNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findAllByUserId(userId, pageable);
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return new NotificationListResponseDto(
                unreadCount,
                notifications.getContent().stream().map(NotificationResponseDto::from).toList()
        );
    }

    @Override
    @Transactional
    public NotificationReadResponseDto markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));
        if (!notification.isOwner(userId)) {
            throw new QuestionAccessDeniedException();
        }
        notification.markAsRead();
        return new NotificationReadResponseDto(notificationId, true);
    }

    @Override
    @Transactional
    public void deleteAll(Long userId) {
        notificationRepository.deleteAllByUserId(userId);
        log.info("알림 전체 삭제. userId={}", userId);
    }

    @Override
    @Transactional
    public void notify(Question question, NotificationType type) {
        notificationRepository.save(Notification.builder()
                .userId(question.getUserId())
                .question(question)
                .type(type)
                .message(type.getDefaultMessage())
                .build());
        log.info("알림 생성. userId={}, questionId={}, type={}",
                question.getUserId(), question.getId(), type);
    }
}
