package com.visited.www.edu.dto.response;

import java.time.LocalDateTime;

public record StageCompleteResponseDto(
        int progressRate,
        boolean isCompleted,
        LocalDateTime completedAt
) {
}
