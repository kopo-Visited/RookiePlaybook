package com.visited.www.inquiry.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InquiryStatus {
    RECEIVED("접수"),
    ANSWERED("답변완료");

    private final String description;
}
