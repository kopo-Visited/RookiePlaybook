package com.visited.www.edu.controller;

import com.visited.www.edu.dto.request.StageCompleteRequestDto;
import com.visited.www.edu.dto.response.StageCompleteResponseDto;
import com.visited.www.edu.service.ProgressService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@Tag(name = "Progress", description = "교육 진도 API")
public class ProgressController {

    private final ProgressService progressService;

    /**
     * EDU-FR-004: 단계 완료 처리
     */
    @Operation(summary = "단계 완료 처리", description = "특정 단계를 완료 처리하고 과정 진도율을 갱신한다")
    @PostMapping("/stage")
    public ApiResponse<StageCompleteResponseDto> completeStage(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody StageCompleteRequestDto request
    ) {
        StageCompleteResponseDto response = progressService.completeStage(userId, request.getStageId());
        return ApiResponse.success(response, "단계가 완료되었습니다.");
    }
}
