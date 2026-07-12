package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import java.time.LocalDateTime;

/** 전체 질문 목록(모든 사용자) 응답 항목. */
public record PublicQuestionListResponseDto(
        Long questionId,
        String title,
        String categoryName,
        String writerName,
        Long writerId,
        QuestionStatus status,
        LocalDateTime createdAt
) {
    public static PublicQuestionListResponseDto from(Question question, String writerName) {
        return new PublicQuestionListResponseDto(
                question.getId(),
                question.getTitle(),
                question.getCategory().getName(),
                writerName,
                question.getUserId(),
                question.getStatus(),
                question.getCreatedAt()
        );
    }
}
