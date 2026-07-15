package com.visited.www.account.controller;

import com.visited.www.account.dto.request.AccountUnlockRequestCreateDto;
import com.visited.www.account.service.AccountUnlockRequestService;
import com.visited.www.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account-unlock-requests")
@RequiredArgsConstructor
public class AccountUnlockRequestController {

    private final AccountUnlockRequestService accountUnlockRequestService;

    @PostMapping
    public ApiResponse<Void> create(@Valid @RequestBody AccountUnlockRequestCreateDto request) {
        accountUnlockRequestService.create(request);
        return ApiResponse.success(null, "잠금해제 요청이 접수되었습니다. 관리자 확인 후 처리됩니다.");
    }
}
