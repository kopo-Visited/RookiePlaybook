package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

/** 비활성 카테고리로 질문 등록/수정 시도 시 400. 메시지는 QNA-FR-001 문구 */
public class InactiveCategoryException extends BusinessException {
    public InactiveCategoryException(Long categoryId) {
        super("선택할 수 없는 카테고리입니다.", ErrorCode.INVALID_REQUEST);
    }
}
