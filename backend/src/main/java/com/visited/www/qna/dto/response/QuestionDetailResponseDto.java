package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Answer;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import java.time.LocalDateTime;

/** QNA-API-003 질문 상세 응답 (사용자) */
public record QuestionDetailResponseDto(
        Long questionId,
        String categoryName,
        String title,
        String content,
        QuestionStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        AnswerResponseDto answer
) {
    public static QuestionDetailResponseDto of(Question question, Answer answer) {
        return new QuestionDetailResponseDto(
                question.getId(),
                question.getCategory().getName(),
                question.getTitle(),
                question.getContent(),
                question.getStatus(),
                question.getCreatedAt(),
                question.getUpdatedAt(),
                answer == null ? null : AnswerResponseDto.from(answer)
        );
    }
}
