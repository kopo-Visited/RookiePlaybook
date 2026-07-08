package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

/** 본인 소유가 아닌 질문/알림 접근 시 403. 메시지는 QNA-FR-003 문구 */
public class QuestionAccessDeniedException extends BusinessException {
    public QuestionAccessDeniedException() {
        super("접근 권한이 없습니다.", ErrorCode.FORBIDDEN);
    }
}
