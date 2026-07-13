package com.visited.www.edu.dto.response;

import java.util.List;

public record EducationDetailResponseDto(
        Long educationId,
        String title,
        String description,
        Integer completionCriteria,
        Integer progressRate,
        Boolean isCompleted,
        List<StageResponseDto> stages,
        Integer contentYear,
        Boolean enrolled,
        Long departmentId,
        String departmentName
) {}
