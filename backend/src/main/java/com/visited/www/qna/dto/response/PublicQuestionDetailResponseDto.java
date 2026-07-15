package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Answer;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import java.time.LocalDateTime;

/** 전체 질문 상세(모든 사용자 열람 가능, 소유자 검증 없음) 응답. */
public record PublicQuestionDetailResponseDto(
        Long questionId,
        String title,
        String content,
        String categoryName,
        String writerName,
        Long writerId,
        QuestionStatus status,
        LocalDateTime createdAt,
        AnswerDto answer
) {
    public record AnswerDto(String content, LocalDateTime createdAt) {
        public static AnswerDto from(Answer answer) {
            return new AnswerDto(answer.getContent(), answer.getCreatedAt());
        }
    }

    public static PublicQuestionDetailResponseDto of(Question question, Answer answer, String writerName) {
        return new PublicQuestionDetailResponseDto(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                question.getCategory().getName(),
                writerName,
                question.getUserId(),
                question.getStatus(),
                question.getCreatedAt(),
                answer == null ? null : AnswerDto.from(answer)
        );
    }
}
