package com.visited.www.edu.controller;

import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.dto.response.StageMaterialResponseDto;
import com.visited.www.edu.service.EducationService;
import com.visited.www.edu.service.ProgressService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Education", description = "교육 과정 API")
public class EducationController {
    private final EducationService educationService;
    private final ProgressService progressService;

    /**
     * EDU-FR-001: 교육 과정 목록 조회 (페이징 적용)
     */
    @Operation(summary = "교육 과정 목록 조회",
            description = "교육 과정 목록을 사용자의 진도 정보와 함께 페이징 조회한다")
    @GetMapping("/educations")
    public ApiResponse<Page<EducationListResponseDto>> getEducations(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<EducationListResponseDto> response = educationService.getEducations(userId, pageable);
        return ApiResponse.success(response);
    }

    /**
     * EDU-FR-002: 교육 과정 상세 조회
     */
    @Operation(summary = "교육 과정 상세 조회",
            description = "교육 과정의 단계 목록과 사용자 진도 정보를 함께 조회한다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "존재하지 않는 교육 과정")
    })
    @GetMapping("/educations/{educationId}")
    public ApiResponse<EducationDetailResponseDto> getEducationDetail(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId,
            @PathVariable Long educationId
    ) {
        EducationDetailResponseDto response = educationService.getEducationDetail(userId, educationId);
        return ApiResponse.success(response);
    }

    /**
     * 수강 시작(enroll): 진도 레코드를 진행중으로 생성 (멱등)
     */
    @Operation(summary = "수강 시작", description = "교육 과정 수강을 시작한다. 진도 레코드가 없으면 진행중으로 생성한다(멱등)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수강 시작 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "존재하지 않는 교육 과정")
    })
    @PostMapping("/educations/{educationId}/enroll")
    public ApiResponse<Void> enroll(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId,
            @PathVariable Long educationId
    ) {
        progressService.enroll(userId, educationId);
        return ApiResponse.<Void>success(null, "수강이 시작되었습니다.");
    }

    /**
     * EDU-FR-003: 단계 자료 조회 (이어보기 위치 포함)
     */
    @Operation(summary = "단계 자료 조회", description = "단계의 학습 자료(영상)를 이어보기 위치와 함께 조회한다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "존재하지 않는 자료")
    })
    @GetMapping("/stages/{stageId}/material")
    public ApiResponse<StageMaterialResponseDto> getStageMaterial(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId,
            @PathVariable Long stageId
    ) {
        StageMaterialResponseDto response = educationService.getStageMaterial(userId, stageId);
        return ApiResponse.success(response);
    }
}