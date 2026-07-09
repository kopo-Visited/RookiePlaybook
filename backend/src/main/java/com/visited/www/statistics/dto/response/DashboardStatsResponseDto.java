package com.visited.www.statistics.dto.response;

import java.util.List;

/** 관리자 대시보드 통계 응답 */
public record DashboardStatsResponseDto(
        long totalUsers,
        double userGrowthRatePercent,
        long totalDocuments,
        double documentGrowthRatePercent,
        long unansweredQuestions,
        List<CategoryDistributionDto> documentCategoryDistribution,
        List<HourlyAccessDto> accessTrend
) {
}
