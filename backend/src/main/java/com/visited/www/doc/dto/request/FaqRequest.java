package com.visited.www.doc.dto.request;

import lombok.Getter;

@Getter
public class FaqRequest {

    private Long categoryId;
    private String question;
    private String answer;
    private Boolean isPublic;
}