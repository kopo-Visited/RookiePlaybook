package com.visited.www.edu.dto.response;

import java.time.LocalDateTime;

public record MyProgressResponseDto(
        Long educationId,
        String title,
        Integer progressRate,
        boolean isCompleted,
        LocalDateTime completedAt
) {
}
