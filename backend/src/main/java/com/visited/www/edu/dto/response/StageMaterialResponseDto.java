package com.visited.www.edu.dto.response;

public record StageMaterialResponseDto(
        Long materialId,
        String title,
        String videoUrl,
        Integer lastWatchedPosition,
        Integer totalDuration
) {
}
