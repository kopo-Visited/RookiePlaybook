package com.visited.www.qna.dto.response;

import com.visited.www.qna.enums.QuestionStatus;

/** QNA-API-011 답변 등록/수정 응답 */
public record AnswerUpsertResponseDto(
        Long answerId,
        QuestionStatus questionStatus,
        boolean isNewAnswer
) {
}
