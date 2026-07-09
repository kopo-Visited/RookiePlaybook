package com.visited.www.edu.dto.response;

public record IncompleteResponseDto(
        Long userId,
        String userName,
        String departmentName,
        String educationTitle,
        Integer progressRate,
        Integer completionCriteria
) {
}
