package com.visited.www.edu.controller;

import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.dto.response.StageMaterialResponseDto;
import com.visited.www.edu.service.EducationService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EducationController {
    private final EducationService educationService;

    /**
     * EDU-FR-001: 교육 과정 목록 조회 (페이징 적용)
     */
    @GetMapping("/educations")
    public ApiResponse<Page<EducationListResponseDto>> getEducations(
            @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<EducationListResponseDto> response = educationService.getEducations(userId, pageable);
        return ApiResponse.success(response);
    }

    /**
     * EDU-FR-002: 교육 과정 상세 조회
     */
    @GetMapping("/educations/{educationId}")
    public ApiResponse<EducationDetailResponseDto> getEducationDetail(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long educationId
    ) {
        EducationDetailResponseDto response = educationService.getEducationDetail(userId, educationId);
        return ApiResponse.success(response);
    }

    /**
     * EDU-FR-003: 단계 자료 조회 (이어보기 위치 포함)
     */
    @Operation(summary = "단계 자료 조회", description = "단계의 학습 자료(영상)를 이어보기 위치와 함께 조회한다")
    @GetMapping("/stages/{stageId}/material")
    public ApiResponse<StageMaterialResponseDto> getStageMaterial(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long stageId
    ) {
        StageMaterialResponseDto response = educationService.getStageMaterial(userId, stageId);
        return ApiResponse.success(response);
    }
}