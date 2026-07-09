package com.visited.www.qna.dto.response;

/** QNA-API-008 알림 읽음 처리 응답 */
public record NotificationReadResponseDto(
        Long notificationId,
        boolean isRead
) {
}
