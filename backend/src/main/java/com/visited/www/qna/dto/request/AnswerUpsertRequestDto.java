package com.visited.www.qna.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** QNA-API-011 답변 등록/수정 요청 */
@Getter
@NoArgsConstructor
public class AnswerUpsertRequestDto {

    @NotBlank(message = "답변 내용을 입력해 주세요.")
    private String content;
}
