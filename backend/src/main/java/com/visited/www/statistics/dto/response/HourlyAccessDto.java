package com.visited.www.statistics.dto.response;

/** 시간대별 접속(최근 로그인 기준) 집계 */
public record HourlyAccessDto(
        int hour,
        long count
) {
}
