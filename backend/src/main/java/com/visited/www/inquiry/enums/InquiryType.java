package com.visited.www.inquiry.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InquiryType {
    PERMISSION("권한 오류"),
    SERVICE("서비스 불편사항"),
    ACCOUNT("계정 문의"),
    ETC("기타");

    private final String description;
}
