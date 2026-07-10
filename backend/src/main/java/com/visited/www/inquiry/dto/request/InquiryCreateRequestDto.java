package com.visited.www.inquiry.dto.request;

import com.visited.www.inquiry.enums.InquiryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InquiryCreateRequestDto(

        @NotNull(message = "문의 유형을 선택해주세요.")
        InquiryType type,

        @NotBlank(message = "제목을 입력해주세요.")
        String title,

        @NotBlank(message = "내용을 입력해주세요.")
        String content

) {
}
