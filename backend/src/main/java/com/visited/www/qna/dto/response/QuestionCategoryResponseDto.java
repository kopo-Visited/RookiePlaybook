package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.QuestionCategory;
import java.time.LocalDateTime;

/** QNA-API-006 질문 카테고리 목록 응답 항목 */
public record QuestionCategoryResponseDto(
        Long categoryId,
        String name,
        String description,
        int sortOrder,
        boolean isActive,
        LocalDateTime createdAt
) {
    public static QuestionCategoryResponseDto from(QuestionCategory category) {
        return new QuestionCategoryResponseDto(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getSortOrder(),
                category.isActive(),
                category.getCreatedAt()
        );
    }
}
