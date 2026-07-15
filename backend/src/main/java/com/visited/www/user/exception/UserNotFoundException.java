package com.visited.www.user.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(Long userId) {
        super("존재하지 않는 사용자입니다. id=" + userId, ErrorCode.NOT_FOUND);
    }
}
