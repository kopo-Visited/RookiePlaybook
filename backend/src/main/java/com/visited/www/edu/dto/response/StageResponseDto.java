package com.visited.www.edu.dto.response;

// StageResponseDto.java
public record StageResponseDto(
        Long stageId,
        String title,
        Integer orderNumber,
        Boolean isCompleted,
        MaterialResponseDto material
) {}
