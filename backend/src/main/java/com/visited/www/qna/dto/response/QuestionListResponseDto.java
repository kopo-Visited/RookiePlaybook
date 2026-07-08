package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import java.time.LocalDateTime;

/** QNA-API-002 내 질문 목록 응답 항목 */
public record QuestionListResponseDto(
        Long questionId,
        String title,
        String categoryName,
        QuestionStatus status,
        LocalDateTime createdAt
) {
    public static QuestionListResponseDto from(Question question) {
        return new QuestionListResponseDto(
                question.getId(),
                question.getTitle(),
                question.getCategory().getName(),
                question.getStatus(),
                question.getCreatedAt()
        );
    }
}
