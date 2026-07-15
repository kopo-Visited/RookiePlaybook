package com.visited.www.doc.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class DocumentNotFoundException extends BusinessException {
    public DocumentNotFoundException(Long id) {
        super("문서를 찾을 수 없습니다. id=" + id, ErrorCode.NOT_FOUND);
    }
}
