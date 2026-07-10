package com.visited.www.user.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class DuplicateDepartmentCodeException extends BusinessException {
    public DuplicateDepartmentCodeException(String code) {
        super("이미 사용 중인 부서 코드입니다. code=" + code, ErrorCode.CONFLICT);
    }
}
