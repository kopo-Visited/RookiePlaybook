package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

/** FAQ 전환 불가 시 409 (QNA-API-013: ANSWERED 아님, 이미 전환됨) */
public class FaqConversionNotAllowedException extends BusinessException {
    public FaqConversionNotAllowedException(String message) {
        super(message, ErrorCode.CONFLICT);
    }
}
