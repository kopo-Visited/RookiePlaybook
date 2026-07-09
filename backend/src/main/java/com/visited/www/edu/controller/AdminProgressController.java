package com.visited.www.edu.controller;

import com.visited.www.edu.dto.response.AdminProgressResponseDto;
import com.visited.www.edu.service.EducationService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/progress")
@RequiredArgsConstructor
@Tag(name = "Admin Progress", description = "관리자 진도 현황 API")
public class AdminProgressController {

    private final EducationService educationService;

    /**
     * EDU-FR-009: 관리자 진도 현황 조회 (부서/과정/완료여부 필터 + 페이징)
     */
    @Operation(summary = "진도 현황 조회",
            description = "전체 사용자의 과정별 진도 현황을 부서/과정/완료여부로 필터링하여 페이징 조회한다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음")
    })
    @GetMapping
    public ApiResponse<Page<AdminProgressResponseDto>> getAdminProgress(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long educationId,
            @RequestParam(required = false) Boolean isCompleted,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<AdminProgressResponseDto> response =
                educationService.getAdminProgress(departmentId, educationId, isCompleted, pageable);
        return ApiResponse.success(response);
    }
}
