package com.visited.www.doc.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class CategoryNotFoundException extends BusinessException {
    public CategoryNotFoundException(String categoryName) {
        super("존재하지 않는 카테고리입니다. name=" + categoryName, ErrorCode.NOT_FOUND);
    }
}
