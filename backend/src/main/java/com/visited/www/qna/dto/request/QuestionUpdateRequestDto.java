package com.visited.www.qna.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** QNA-API-004 질문 수정 요청. 필드는 등록과 같지만 네이밍 규칙({도메인}{동작}RequestDto)에 따라 분리 */
@Getter
@NoArgsConstructor
public class QuestionUpdateRequestDto {

    @NotNull(message = "카테고리를 선택해 주세요.")
    private Long categoryId;

    @NotBlank(message = "제목은 200자 이내로 입력해 주세요.")
    @Size(max = 200, message = "제목은 200자 이내로 입력해 주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해 주세요.")
    private String content;
}
