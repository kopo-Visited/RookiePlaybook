package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class NotificationNotFoundException extends BusinessException {
    public NotificationNotFoundException(Long id) {
        super("알림을 찾을 수 없습니다. id: " + id, ErrorCode.NOT_FOUND);
    }
}
