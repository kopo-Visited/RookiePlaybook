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

    /*
     * 이메일 미존재 / 잠금 아님 / 정상 접수 세 경우 모두 호출자에게는 동일하게 반환한다.
     * 인증 없이 호출 가능한 공개 엔드포인트라, 경우별로 다른 예외를 던지면 계정 존재 여부와
     * 잠금 상태가 응답 코드/메시지로 그대로 노출되어 계정 열거(account enumeration)에 악용된다.
     * 실제 요청 레코드는 이메일이 존재하고 잠금 상태일 때만 조용히 생성한다.
     */
    public void create(AccountUnlockRequestCreateDto request) {
        userRepository.findByEmail(request.email())
                .filter(user -> user.getStatus() == UserStatus.LOCKED)
                .ifPresent(user -> accountUnlockRequestRepository.save(
                        AccountUnlockRequest.builder()
                                .user(user)
                                .name(request.name())
                                .email(request.email())
                                .employeeNo(request.employeeNo())
                                .departmentName(request.departmentName())
                                .phone(request.phone())
                                .memo(request.memo())
                                .build()
                ));
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
