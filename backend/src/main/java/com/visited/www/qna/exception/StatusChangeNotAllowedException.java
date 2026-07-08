package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

/** 상태 변경 불가 시 409 (QNA-API-012: 동일 상태 변경, 답변 미등록 ANSWERED 변경) */
public class StatusChangeNotAllowedException extends BusinessException {
    public StatusChangeNotAllowedException(String message) {
        super(message, ErrorCode.CONFLICT);
    }
}
