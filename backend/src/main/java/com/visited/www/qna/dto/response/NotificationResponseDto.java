package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Notification;
import com.visited.www.qna.enums.NotificationType;
import java.time.LocalDateTime;

/** QNA-API-007 알림 목록 응답 항목 */
public record NotificationResponseDto(
        Long notificationId,
        Long questionId,
        NotificationType type,
        String message,
        boolean isRead,
        LocalDateTime createdAt
) {
    public static NotificationResponseDto from(Notification notification) {
        return new NotificationResponseDto(
                notification.getId(),
                notification.getQuestion().getId(),
                notification.getType(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
