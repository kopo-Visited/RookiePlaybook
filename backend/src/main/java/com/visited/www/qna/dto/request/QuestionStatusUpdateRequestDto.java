package com.visited.www.qna.dto.request;

import com.visited.www.qna.enums.QuestionStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** QNA-API-012 질문 상태 변경 요청 */
@Getter
@NoArgsConstructor
public class QuestionStatusUpdateRequestDto {

    @NotNull(message = "잘못된 상태값입니다.")
    private QuestionStatus status;

    @Size(max = 500, message = "사유는 500자 이내로 입력해 주세요.")
    private String memo;
}
