package com.visited.www.edu;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class StageNotFoundException extends BusinessException {

    public StageNotFoundException() {
        super(ErrorCode.NOT_FOUND);
    }
}
