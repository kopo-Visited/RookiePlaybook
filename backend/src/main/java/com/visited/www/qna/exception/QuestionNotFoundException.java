package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class QuestionNotFoundException extends BusinessException {
    public QuestionNotFoundException(Long id) {
        // 메시지는 QNA-FR-003 예외 처리 문구를 따른다
        super("존재하지 않는 질문입니다.", ErrorCode.NOT_FOUND);
        log.warn("존재하지 않는 질문 접근 시도. questionId={}", id);
    }
}
