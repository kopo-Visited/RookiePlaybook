package com.visited.www.qna.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** 질문 상태. API 명세서 QNA-API-012 기준 */
@Getter
@RequiredArgsConstructor
public enum QuestionStatus {
    RECEIVED("접수"),
    IN_PROGRESS("처리중"),
    ANSWERED("답변완료"),
    ON_HOLD("보류");

    private final String description;
}
