package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Answer;
import java.time.LocalDateTime;

public record AnswerResponseDto(
        Long answerId,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AnswerResponseDto from(Answer answer) {
        return new AnswerResponseDto(
                answer.getId(),
                answer.getContent(),
                answer.getCreatedAt(),
                answer.getUpdatedAt()
        );
    }
}
