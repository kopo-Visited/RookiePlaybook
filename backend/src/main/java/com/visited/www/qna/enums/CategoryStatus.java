package com.visited.www.qna.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** 질문 카테고리 상태. 사용 중인 카테고리는 삭제 대신 INACTIVE 처리한다 */
@Getter
@RequiredArgsConstructor
public enum CategoryStatus {
    ACTIVE("사용"),
    INACTIVE("미사용");

    private final String description;
}
