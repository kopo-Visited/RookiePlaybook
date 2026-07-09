package com.visited.www.edu;

import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;

public class StageInUseException extends BusinessException {

    public StageInUseException() {
        super("완료 이력 또는 시청 진도가 있는 단계는 삭제할 수 없습니다.", ErrorCode.CONFLICT);
    }
}
