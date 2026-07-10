package com.visited.www.user.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class DuplicateEmployeeNoException extends BusinessException {
    public DuplicateEmployeeNoException(String employeeNo) {
        super("이미 사용 중인 사번입니다. employeeNo=" + employeeNo, ErrorCode.CONFLICT);
    }
}
