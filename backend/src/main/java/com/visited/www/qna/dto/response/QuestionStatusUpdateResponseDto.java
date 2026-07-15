package com.visited.www.qna.dto.response;

import com.visited.www.qna.enums.QuestionStatus;

/** QNA-API-012 상태 변경 응답 */
public record QuestionStatusUpdateResponseDto(
        Long questionId,
        QuestionStatus status
) {
}
