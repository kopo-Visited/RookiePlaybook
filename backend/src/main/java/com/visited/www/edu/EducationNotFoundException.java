package com.visited.www.edu;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class EducationNotFoundException extends BusinessException {

    public EducationNotFoundException() {
        super(ErrorCode.NOT_FOUND);
    }
}
