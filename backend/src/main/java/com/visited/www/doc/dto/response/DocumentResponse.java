package com.visited.www.doc.dto.response;

import com.visited.www.doc.entity.Document;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class DocumentResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String content;
    private Boolean isPublic;
    private String status;
    private Long viewCount;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DocumentResponse from(Document document) {
        List<String> tags = document.getDocumentTags() == null
                ? List.of()
                : document.getDocumentTags()
                .stream()
                .map(documentTag -> documentTag.getTag().getTagName())
                .toList();

        return DocumentResponse.builder()
                .id(document.getId())
                .categoryId(document.getCategory().getId())
                .categoryName(document.getCategory().getCategoryName())
                .title(document.getTitle())
                .content(document.getContent())
                .isPublic(document.getIsPublic())
                .status(document.getStatus())
                .viewCount(document.getViewCount())
                .tags(tags)
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}