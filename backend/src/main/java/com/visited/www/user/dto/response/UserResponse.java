package com.visited.www.user.dto.response;

import com.visited.www.entity.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long userId,
        String name,
        String email,
        Long departmentId,
        String departmentName,
        Long roleId,
        String roleName,
        String roleCode,
        String position,
        String employeeNo,
        String phone,
        String status,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment().getId(),
                user.getDepartment().getName(),
                user.getRole().getId(),
                user.getRole().getName(),
                user.getRole().getCode(),
                user.getPosition(),
                user.getEmployeeNo(),
                user.getPhone(),
                user.getStatus().name(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }
}