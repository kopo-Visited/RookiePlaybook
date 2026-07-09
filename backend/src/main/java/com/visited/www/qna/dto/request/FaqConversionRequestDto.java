package com.visited.www.qna.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** QNA-API-013 FAQ 전환 요청 */
@Getter
@NoArgsConstructor
public class FaqConversionRequestDto {

    @NotNull(message = "FAQ 카테고리를 선택해 주세요.")
    private Long faqCategoryId;

    @NotBlank(message = "FAQ 질문을 입력해 주세요.")
    private String question;

    @NotBlank(message = "FAQ 답변을 입력해 주세요.")
    private String answer;
}
