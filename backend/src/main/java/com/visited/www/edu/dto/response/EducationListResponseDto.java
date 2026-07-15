package com.visited.www.edu.dto.response;

import java.time.LocalDateTime;

public record EducationListResponseDto(
        Long educationId,
        String title,
        Integer totalStages,
        Integer completedStages,
        Integer progressRate,
        Boolean isCompleted,
        LocalDateTime completedAt,
        Integer contentYear,
        Boolean enrolled,
        Long departmentId,
        String departmentName
) {}
