package com.visited.www.qna.dto.response;

import java.util.List;

/** QNA-API-007 알림 목록 응답. 명세 형식은 unreadCount + content */
public record NotificationListResponseDto(
        long unreadCount,
        List<NotificationResponseDto> content
) {
}
