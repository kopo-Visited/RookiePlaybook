package com.visited.www.doc.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class FaqNotFoundException extends BusinessException {
    public FaqNotFoundException(Long id) {
        super("FAQ를 찾을 수 없습니다. id=" + id, ErrorCode.NOT_FOUND);
    }
}
