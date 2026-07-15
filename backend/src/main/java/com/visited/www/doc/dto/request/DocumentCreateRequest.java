package com.visited.www.doc.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DocumentCreateRequest {

    private String categoryName;
    private String title;
    private String content;
    private Boolean isPublic;
}
