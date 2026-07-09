package com.visited.www.qna.dto.response;

/** QNA-API-013 FAQ 전환 응답 */
public record FaqConversionResponseDto(
        Long faqId,
        Long questionId
) {
}
