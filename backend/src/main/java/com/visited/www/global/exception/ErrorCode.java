package com.visited.www.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "요청값을 확인해주세요."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "조회된 데이터가 없습니다."),
    CONFLICT(HttpStatus.CONFLICT, "요청을 처리할 수 없는 상태입니다."),
    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다."),
    ACCOUNT_LOCKED(HttpStatus.LOCKED, "비밀번호를 5회 잘못 입력하여 계정이 잠겼습니다. 관리자에게 잠금해제를 요청해주세요."),
    PASSWORD_CHANGE_REQUIRED(HttpStatus.FORBIDDEN, "초기 비밀번호를 변경한 후 이용할 수 있습니다."),
    AI_RESPONSE_FAILED(HttpStatus.SERVICE_UNAVAILABLE, "AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요."),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "일시적인 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;
}