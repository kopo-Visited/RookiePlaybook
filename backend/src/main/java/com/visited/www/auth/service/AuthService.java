package com.visited.www.auth.service;

import com.visited.www.auth.dto.request.LoginRequest;
import com.visited.www.auth.dto.response.LoginResponse;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    public LoginResponse login(LoginRequest request) {
        /*
         * TODO
         * 1. UserRepository로 이메일 조회
         * 2. PasswordEncoder로 비밀번호 검증
         * 3. 비활성 사용자 로그인 제한
         * 4. JWT 또는 Session 인증 처리
         * 5. 로그인 성공 시 사용자 정보와 토큰 반환
         */

        return new LoginResponse(
                "temp-access-token",
                1L,
                "관리자",
                request.email(),
                "인사팀",
                "ADMIN"
        );
    }

    public void logout() {
        /*
         * TODO
         * JWT 사용 시: 클라이언트 토큰 삭제 또는 블랙리스트 처리 검토
         * Session 사용 시: 세션 무효화 처리
         */
    }
}