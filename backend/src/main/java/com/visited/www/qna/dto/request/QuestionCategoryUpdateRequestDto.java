package com.visited.www.qna.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** QNA-API-015 질문 카테고리 수정 요청 */
@Getter
@NoArgsConstructor
public class QuestionCategoryUpdateRequestDto {

    @NotBlank(message = "카테고리명을 확인해 주세요.")
    @Size(max = 50, message = "카테고리명을 확인해 주세요.")
    private String name;

    @Size(max = 200, message = "설명은 200자 이내로 입력해 주세요.")
    private String description;

    private Integer sortOrder;

    private Boolean isActive;
}
