package com.visited.www.statistics.dto.response;

import com.visited.www.entity.User;
import com.visited.www.qna.entity.Question;
import java.time.LocalDateTime;

/** 대시보드 "최근 질문 현황" 위젯 항목 */
public record RecentQuestionDto(
        Long id,
        String title,
        String departmentName,
        LocalDateTime createdAt
) {
    public static RecentQuestionDto from(Question question, User writer) {
        return new RecentQuestionDto(
                question.getId(),
                question.getTitle(),
                writer != null ? writer.getDepartment().getName() : null,
                question.getCreatedAt()
        );
    }
}
