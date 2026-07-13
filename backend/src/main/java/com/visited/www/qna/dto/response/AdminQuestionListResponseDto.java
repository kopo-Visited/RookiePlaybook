package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import java.time.LocalDateTime;

/**
 * QNA-API-009 관리자 질문 목록 응답 항목.
 * writerName, departmentName은 A파트 users merge 후 채운다. 현재는 null.
 */
public record AdminQuestionListResponseDto(
        Long questionId,
        String title,
        String writerName,
        String departmentName,
        String categoryName,
        QuestionStatus status,
        boolean isPublic,
        LocalDateTime createdAt
) {
    public static AdminQuestionListResponseDto from(Question question) {
        return from(question, null, null);
    }

    public static AdminQuestionListResponseDto from(Question question,
                                                    String writerName, String departmentName) {
        return new AdminQuestionListResponseDto(
                question.getId(),
                question.getTitle(),
                writerName,
                departmentName,
                question.getCategory().getName(),
                question.getStatus(),
                Boolean.TRUE.equals(question.getIsPublic()),
                question.getCreatedAt()
        );
    }
}
