package com.visited.www.statistics.dto.response;

import com.visited.www.doc.entity.Document;
import java.time.LocalDateTime;

/** 대시보드 "최근 등록 문서" 위젯 항목 */
public record RecentDocumentDto(
        Long id,
        String title,
        String categoryName,
        LocalDateTime createdAt
) {
    public static RecentDocumentDto from(Document document) {
        return new RecentDocumentDto(
                document.getId(),
                document.getTitle(),
                document.getCategory().getCategoryName(),
                document.getCreatedAt()
        );
    }
}
