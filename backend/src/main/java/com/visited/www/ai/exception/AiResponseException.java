package com.visited.www.ai.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AiResponseException extends BusinessException {
    public AiResponseException(Throwable cause) {
        super(ErrorCode.AI_RESPONSE_FAILED.getMessage(), ErrorCode.AI_RESPONSE_FAILED, cause);
        log.error("AI 응답 생성 실패", cause);
    }
}
