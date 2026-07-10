package com.visited.www.auth.service;

import com.visited.www.entity.User;
import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import com.visited.www.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * 로그인 실패 카운트 증가/잠금 처리를 별도 트랜잭션(REQUIRES_NEW)으로 커밋한다.
 * AuthService.login()은 실패 시 예외를 던져 트랜잭션이 롤백되므로,
 * 같은 트랜잭션 안에서 카운트를 올리면 롤백과 함께 증가분이 사라진다.
 */
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final int MAX_FAILED_LOGIN_COUNT = 5;

    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean registerFailure(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 사용자입니다.", ErrorCode.NOT_FOUND));

        user.increaseFailedLoginCount();

        if (user.getFailedLoginCount() >= MAX_FAILED_LOGIN_COUNT) {
            user.lock();
            return true;
        }
        return false;
    }
}
