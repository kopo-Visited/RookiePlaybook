package com.visited.www.auth.service;

import com.visited.www.auth.dto.request.LoginRequest;
import com.visited.www.auth.dto.response.LoginResponse;
import com.visited.www.entity.User;
import com.visited.www.entity.UserStatus;
import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import com.visited.www.global.security.JwtProvider;
import com.visited.www.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private static final String LOGIN_FAILED_MESSAGE = "이메일 또는 비밀번호가 일치하지 않습니다.";

    // 존재하지 않는 이메일일 때도 동일한 시간이 걸리도록 더미 해시와 비교해
    // 응답 시간 차이로 계정 존재 여부가 노출되는 것을 막는다 (bcrypt 공식 예시 해시)
    private static final String DUMMY_PASSWORD_HASH =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final LoginAttemptService loginAttemptService;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            passwordEncoder.matches(request.password(), DUMMY_PASSWORD_HASH);
            throw new BusinessException(LOGIN_FAILED_MESSAGE, ErrorCode.UNAUTHORIZED);
        }

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("비활성화된 계정입니다. 관리자에게 문의해주세요.", ErrorCode.FORBIDDEN);
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            boolean locked = loginAttemptService.registerFailure(user.getId());
            if (locked) {
                throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
            }
            throw new BusinessException(LOGIN_FAILED_MESSAGE, ErrorCode.UNAUTHORIZED);
        }

        user.updateLastLoginAt();

        String accessToken = jwtProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().getCode()
        );

        return new LoginResponse(
                accessToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment().getName(),
                user.getRole().getName(),
                user.getRole().getCode(),
                user.isPasswordChangeRequired()
        );
    }

    public void logout() {
        /*
         * JWT는 서버에 상태를 두지 않으므로(stateless) 로그아웃은
         * 클라이언트가 보관 중인 토큰을 폐기하는 것으로 처리한다.
         */
    }
}
