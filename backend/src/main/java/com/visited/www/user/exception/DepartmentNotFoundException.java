package com.visited.www.user.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class DepartmentNotFoundException extends BusinessException {
    public DepartmentNotFoundException(Long departmentId) {
        super("존재하지 않는 부서입니다. id=" + departmentId, ErrorCode.NOT_FOUND);
    }
}
