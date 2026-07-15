package com.visited.www.edu;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class StageLockedException extends BusinessException {

    public StageLockedException() {
        super("이전 단계를 먼저 완료해야 이 단계를 수강할 수 있습니다.", ErrorCode.FORBIDDEN);
    }
}
