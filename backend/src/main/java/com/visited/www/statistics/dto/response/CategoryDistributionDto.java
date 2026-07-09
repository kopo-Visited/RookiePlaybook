package com.visited.www.statistics.dto.response;

/** 카테고리별 문서 수 분포 */
public record CategoryDistributionDto(
        String categoryName,
        Long count
) {
}
