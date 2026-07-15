package com.visited.www.account.controller;

import com.visited.www.account.dto.response.AccountUnlockRequestResponseDto;
import com.visited.www.account.service.AccountUnlockRequestService;
import com.visited.www.global.response.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/account-unlock-requests")
@RequiredArgsConstructor
public class AdminAccountUnlockRequestController {

    private final AccountUnlockRequestService accountUnlockRequestService;

    @GetMapping
    public ApiResponse<List<AccountUnlockRequestResponseDto>> getRequests() {
        return ApiResponse.success(accountUnlockRequestService.getRequests());
    }

    @GetMapping("/pending-count")
    public ApiResponse<Long> getPendingCount() {
        return ApiResponse.success(accountUnlockRequestService.countPending());
    }

    @PostMapping("/{requestId}/resolve")
    public ApiResponse<AccountUnlockRequestResponseDto> resolve(
            Authentication authentication,
            @PathVariable Long requestId
    ) {
        Long adminId = (Long) authentication.getPrincipal();
        return ApiResponse.success(
                accountUnlockRequestService.resolve(requestId, adminId),
                "비밀번호가 초기화되고 계정 잠금이 해제되었습니다."
        );
    }
}
