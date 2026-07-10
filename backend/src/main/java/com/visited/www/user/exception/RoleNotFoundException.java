package com.visited.www.user.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class RoleNotFoundException extends BusinessException {
    public RoleNotFoundException(Long roleId) {
        super("존재하지 않는 권한입니다. id=" + roleId, ErrorCode.NOT_FOUND);
    }
}
