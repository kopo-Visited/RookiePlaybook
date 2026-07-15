package com.visited.www.auth.dto.response;

public record LoginResponse(
        String accessToken,
        Long userId,
        String name,
        String email,
        String departmentName,
        String roleName,
        String roleCode,
        boolean passwordChangeRequired
) {
}