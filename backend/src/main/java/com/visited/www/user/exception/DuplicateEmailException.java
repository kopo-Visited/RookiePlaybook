package com.visited.www.user.exception;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class DuplicateEmailException extends BusinessException {
    public DuplicateEmailException(String email) {
        super("이미 사용 중인 이메일입니다. email=" + email, ErrorCode.CONFLICT);
    }
}
