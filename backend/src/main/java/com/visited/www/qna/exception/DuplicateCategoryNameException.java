package com.visited.www.qna.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

/** 카테고리명 중복 시 409 (QNA-API-014, 015) */
public class DuplicateCategoryNameException extends BusinessException {
    public DuplicateCategoryNameException(String name) {
        super("이미 존재하는 카테고리 이름입니다. name: " + name, ErrorCode.CONFLICT);
    }
}
