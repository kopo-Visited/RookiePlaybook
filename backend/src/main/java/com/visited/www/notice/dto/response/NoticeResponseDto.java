package com.visited.www.notice.dto.response;

import com.visited.www.notice.entity.Notice;
import java.time.LocalDateTime;

public record NoticeResponseDto(
        Long noticeId,
        String title,
        String content,
        String writerName,
        LocalDateTime createdAt,
        boolean isNew
) {
    private static final int NEW_THRESHOLD_DAYS = 7;

    public static NoticeResponseDto from(Notice notice) {
        boolean isNew = notice.getCreatedAt() != null
                && notice.getCreatedAt().isAfter(LocalDateTime.now().minusDays(NEW_THRESHOLD_DAYS));

        return new NoticeResponseDto(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.getWriter().getName(),
                notice.getCreatedAt(),
                isNew
        );
    }
}
