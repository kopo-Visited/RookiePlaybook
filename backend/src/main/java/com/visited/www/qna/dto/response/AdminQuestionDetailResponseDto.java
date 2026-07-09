package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Answer;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import java.time.LocalDateTime;
import java.util.List;

/** QNA-API-010 관리자 질문 상세 응답 (작성자, 답변, 상태 이력 포함) */
public record AdminQuestionDetailResponseDto(
        Long questionId,
        String title,
        String content,
        QuestionStatus status,
        LocalDateTime createdAt,
        WriterDto writer,
        CategoryDto category,
        AdminAnswerDto answer,
        Long convertedFaqId,
        List<QuestionStatusHistoryResponseDto> histories
) {
    /** 작성자 요약. name, departmentName은 users merge 후 채운다 */
    public record WriterDto(Long userId, String name, String departmentName) {
    }

    public record CategoryDto(Long categoryId, String name) {
    }

    /** 관리자 화면용 답변. adminName은 users merge 후 채운다 */
    public record AdminAnswerDto(Long answerId, String content, Long adminId, String adminName,
                                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        public static AdminAnswerDto from(Answer answer) {
            return new AdminAnswerDto(
                    answer.getId(),
                    answer.getContent(),
                    answer.getAdminId(),
                    null,  // TODO: users merge 후 관리자 이름
                    answer.getCreatedAt(),
                    answer.getUpdatedAt()
            );
        }
    }

    public static AdminQuestionDetailResponseDto of(Question question, Answer answer,
                                                    List<QuestionStatusHistoryResponseDto> histories) {
        return new AdminQuestionDetailResponseDto(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                question.getStatus(),
                question.getCreatedAt(),
                new WriterDto(question.getUserId(), null, null),  // TODO: users merge 후
                new CategoryDto(question.getCategory().getId(), question.getCategory().getName()),
                answer == null ? null : AdminAnswerDto.from(answer),
                question.getConvertedFaqId(),
                histories
        );
    }
}
