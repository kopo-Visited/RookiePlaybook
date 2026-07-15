package com.visited.www.qna.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 질문 공개/비공개 전환 요청 (관리자) */
@Getter
@NoArgsConstructor
public class QuestionVisibilityUpdateRequestDto {

    @NotNull(message = "공개 여부는 필수입니다.")
    private Boolean isPublic;
}
