package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class QuestionCategoryNotFoundException extends BusinessException {
    public QuestionCategoryNotFoundException(Long id) {
        super("질문 카테고리를 찾을 수 없습니다. id: " + id, ErrorCode.NOT_FOUND);
    }
}
