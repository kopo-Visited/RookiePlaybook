package com.visited.www.doc.dto.response;

import com.visited.www.doc.entity.Faq;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class FaqResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String question;
    private String answer;
    private Boolean isPublic;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FaqResponse from(Faq faq) {
        return FaqResponse.builder()
                .id(faq.getId())
                .categoryId(faq.getCategory().getId())
                .categoryName(faq.getCategory().getCategoryName())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .isPublic(faq.getIsPublic())
                .status(faq.getStatus())
                .createdAt(faq.getCreatedAt())
                .updatedAt(faq.getUpdatedAt())
                .build();
    }
}