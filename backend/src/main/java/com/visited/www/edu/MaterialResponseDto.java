package com.visited.www.edu;

// MaterialResponseDto.java
public record MaterialResponseDto(
        Long materialId,
        String title,
        String videoUrl,
        Integer lastWatchedPosition
) {}
