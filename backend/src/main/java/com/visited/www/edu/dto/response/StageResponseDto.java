package com.visited.www.edu.dto.response;

import com.visited.www.edu.MaterialResponseDto;

public record StageResponseDto(
        Long stageId,
        String title,
        String description,
        Integer orderNumber,
        Boolean isCompleted,
        MaterialResponseDto material
) {}
