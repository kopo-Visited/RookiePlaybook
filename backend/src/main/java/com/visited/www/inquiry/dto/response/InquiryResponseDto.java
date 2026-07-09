package com.visited.www.inquiry.dto.response;

import com.visited.www.inquiry.entity.Inquiry;
import com.visited.www.inquiry.enums.InquiryStatus;
import com.visited.www.inquiry.enums.InquiryType;
import java.time.LocalDateTime;

public record InquiryResponseDto(
        Long inquiryId,
        InquiryType type,
        String title,
        String content,
        String answer,
        InquiryStatus status,
        String writerName,
        LocalDateTime createdAt,
        LocalDateTime answeredAt
) {
    public static InquiryResponseDto from(Inquiry inquiry) {
        return new InquiryResponseDto(
                inquiry.getId(),
                inquiry.getType(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getAnswer(),
                inquiry.getStatus(),
                inquiry.getWriter().getName(),
                inquiry.getCreatedAt(),
                inquiry.getAnsweredAt()
        );
    }
}
