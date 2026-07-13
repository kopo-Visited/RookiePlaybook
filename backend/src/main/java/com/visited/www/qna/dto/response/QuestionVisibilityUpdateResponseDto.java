package com.visited.www.qna.dto.response;

/** 질문 공개/비공개 전환 응답 (관리자) */
public record QuestionVisibilityUpdateResponseDto(Long questionId, boolean isPublic) {
}
