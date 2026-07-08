package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;

/** QNA-API-001 응답 */
public record QuestionCreateResponseDto(
        Long questionId,
        QuestionStatus status
) {
    public static QuestionCreateResponseDto from(Question question) {
        return new QuestionCreateResponseDto(question.getId(), question.getStatus());
    }
}
