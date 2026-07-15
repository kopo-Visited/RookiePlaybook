package com.visited.www.qna.dto.response;

import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;

/** QNA-API-001 응답 */
public record QuestionCreateResponseDto(
        Long questionId,
        QuestionStatus status,
        String aiSuggestedCategory,
        boolean categoryMatched
) {
    /** AI 제안 포함. aiSuggested가 null이거나 선택 카테고리와 같으면 matched=true */
    public static QuestionCreateResponseDto of(Question question, String chosenCategoryName,
                                               String aiSuggested) {
        boolean matched = aiSuggested == null || aiSuggested.equals(chosenCategoryName);
        return new QuestionCreateResponseDto(
                question.getId(), question.getStatus(), aiSuggested, matched);
    }

    public static QuestionCreateResponseDto from(Question question) {
        return new QuestionCreateResponseDto(question.getId(), question.getStatus(), null, true);
    }
}
