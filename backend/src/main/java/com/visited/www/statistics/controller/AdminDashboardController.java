package com.visited.www.statistics.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.statistics.dto.response.DashboardStatsResponseDto;
import com.visited.www.statistics.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "AdminDashboard", description = "관리자 대시보드 통계 API")
public class AdminDashboardController {

    private final StatisticsService statisticsService;

    @Operation(summary = "대시보드 통계 조회",
            description = "전체 사용자/문서 수와 전주 대비 증감률, 미답변 질문 수, "
                    + "문서 카테고리별 분포, 시간대별 접속 추이(최근 로그인 기준 근사치)를 조회한다")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponseDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(statisticsService.getDashboardStats()));
    }
}
