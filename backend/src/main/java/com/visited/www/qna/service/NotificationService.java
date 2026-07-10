package com.visited.www.qna.service;

import com.visited.www.qna.dto.response.NotificationListResponseDto;
import com.visited.www.qna.dto.response.NotificationReadResponseDto;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.NotificationType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    NotificationListResponseDto getMyNotifications(Long userId, Pageable pageable);

    NotificationReadResponseDto markAsRead(Long userId, Long notificationId);

    /** 본인 알림 전체 삭제 */
    void deleteAll(Long userId);

    /** 답변 등록/상태 변경 시 질문자에게 알림 생성. AdminQnaService에서 호출한다 */
    void notify(Question question, NotificationType type);
}
