package com.visited.www.account.dto.response;

import com.visited.www.account.entity.AccountUnlockRequest;
import java.time.LocalDateTime;

public record AccountUnlockRequestResponseDto(
        Long requestId,
        String name,
        String email,
        String employeeNo,
        String departmentName,
        String phone,
        String memo,
        String status,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt,
        String resolvedByName
) {
    public static AccountUnlockRequestResponseDto from(AccountUnlockRequest request) {
        return new AccountUnlockRequestResponseDto(
                request.getId(),
                request.getName(),
                request.getEmail(),
                request.getEmployeeNo(),
                request.getDepartmentName(),
                request.getPhone(),
                request.getMemo(),
                request.getStatus().name(),
                request.getCreatedAt(),
                request.getResolvedAt(),
                request.getResolvedBy() != null ? request.getResolvedBy().getName() : null
        );
    }
}
