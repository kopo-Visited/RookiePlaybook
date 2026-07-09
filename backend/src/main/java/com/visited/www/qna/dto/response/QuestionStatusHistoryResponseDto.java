package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.QuestionStatusHistory;
import com.visited.www.qna.enums.QuestionStatus;
import java.time.LocalDateTime;

/** QNA-API-010 상태 변경 이력 항목. changedByName은 users merge 후 채운다 */
public record QuestionStatusHistoryResponseDto(
        Long historyId,
        QuestionStatus previousStatus,
        QuestionStatus newStatus,
        Long changedBy,
        String changedByName,
        String memo,
        LocalDateTime createdAt
) {
    public static QuestionStatusHistoryResponseDto from(QuestionStatusHistory history) {
        return new QuestionStatusHistoryResponseDto(
                history.getId(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getChangedBy(),
                null,  // TODO: users merge 후 변경자 이름
                history.getMemo(),
                history.getCreatedAt()
        );
    }
}
