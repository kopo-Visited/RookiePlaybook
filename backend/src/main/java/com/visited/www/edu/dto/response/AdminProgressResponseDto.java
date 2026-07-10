package com.visited.www.edu.dto.response;

import java.time.LocalDateTime;

public record AdminProgressResponseDto(
        Long userId,
        String userName,
        String departmentName,
        String educationTitle,
        Integer progressRate,
        boolean isCompleted,
        LocalDateTime lastStudiedAt
) {
}
