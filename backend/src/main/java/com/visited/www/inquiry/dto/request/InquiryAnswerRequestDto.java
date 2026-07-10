package com.visited.www.inquiry.dto.request;

import jakarta.validation.constraints.NotBlank;

public record InquiryAnswerRequestDto(

        @NotBlank(message = "답변 내용을 입력해주세요.")
        String answer

) {
}
