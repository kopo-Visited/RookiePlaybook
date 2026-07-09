package com.visited.www.edu;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class MaterialNotFoundException extends BusinessException {

    public MaterialNotFoundException() {
        super(ErrorCode.NOT_FOUND);
    }
}
