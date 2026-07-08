package com.visited.www.qna.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NotificationType {
    ANSWER_REGISTERED("질문에 답변이 등록되었습니다."),
    STATUS_CHANGED("질문 상태가 변경되었습니다.");

    private final String defaultMessage;
}
