package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

/**
 * RECEIVED 상태가 아닌 질문의 수정/삭제 시도 시 403.
 * 메시지는 QNA-FR-004/005 문구를 따른다 (수정/삭제 구분).
 */
public class QuestionNotEditableException extends BusinessException {

    private QuestionNotEditableException(String message) {
        super(message, ErrorCode.FORBIDDEN);
    }

    public static QuestionNotEditableException forUpdate() {
        return new QuestionNotEditableException("답변이 진행 중인 질문은 수정할 수 없습니다.");
    }

    public static QuestionNotEditableException forDelete() {
        return new QuestionNotEditableException("답변이 진행 중인 질문은 삭제할 수 없습니다.");
    }
}
