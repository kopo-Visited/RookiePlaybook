package com.visited.www.account.service;

import com.visited.www.account.dto.request.AccountUnlockRequestCreateDto;
import com.visited.www.account.dto.response.AccountUnlockRequestResponseDto;
import com.visited.www.account.entity.AccountUnlockRequest;
import com.visited.www.account.entity.AccountUnlockRequestStatus;
import com.visited.www.account.repository.AccountUnlockRequestRepository;
import com.visited.www.entity.User;
import com.visited.www.entity.UserStatus;
import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import com.visited.www.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountUnlockRequestService {

    // 관리자가 잠금해제 처리 시 되돌리는 초기 비밀번호. 사용자는 로그인 후 반드시 변경해야 한다.
    private static final String INITIAL_PASSWORD = "0000";

    private final AccountUnlockRequestRepository accountUnlockRequestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountUnlockRequestResponseDto create(AccountUnlockRequestCreateDto request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("일치하는 계정을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        if (user.getStatus() != UserStatus.LOCKED) {
            throw new BusinessException("잠긴 계정이 아닙니다.", ErrorCode.INVALID_REQUEST);
        }

        AccountUnlockRequest saved = accountUnlockRequestRepository.save(
                AccountUnlockRequest.builder()
                        .user(user)
                        .name(request.name())
                        .email(request.email())
                        .employeeNo(request.employeeNo())
                        .departmentName(request.departmentName())
                        .phone(request.phone())
                        .memo(request.memo())
                        .build()
        );

        return AccountUnlockRequestResponseDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AccountUnlockRequestResponseDto> getRequests() {
        return accountUnlockRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AccountUnlockRequestResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countPending() {
        return accountUnlockRequestRepository.countByStatus(AccountUnlockRequestStatus.PENDING);
    }

    public AccountUnlockRequestResponseDto resolve(Long requestId, Long adminId) {
        AccountUnlockRequest request = accountUnlockRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException("요청을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));

        if (request.isResolved()) {
            throw new BusinessException("이미 처리된 요청입니다.", ErrorCode.CONFLICT);
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 관리자입니다.", ErrorCode.NOT_FOUND));

        request.getUser().unlockWithPasswordReset(passwordEncoder.encode(INITIAL_PASSWORD));
        request.resolve(admin);

        return AccountUnlockRequestResponseDto.from(request);
    }
}
