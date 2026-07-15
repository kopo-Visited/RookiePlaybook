package com.visited.www.edu;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class EducationInUseException extends BusinessException {

    public EducationInUseException() {
        super("단계 또는 학습 진도가 있는 과정은 삭제할 수 없습니다.", ErrorCode.CONFLICT);
    }
}
