package com.visited.www.edu.controller;

import com.visited.www.edu.dto.request.StageCompleteRequestDto;
import com.visited.www.edu.dto.request.VideoProgressRequestDto;
import com.visited.www.edu.dto.response.MyProgressResponseDto;
import com.visited.www.edu.dto.response.StageCompleteResponseDto;
import com.visited.www.edu.service.ProgressService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    /**
     * EDU-FR-003: 영상 시청 위치 저장
     */
    @Operation(summary = "영상 시청 위치 저장", description = "영상 이어보기를 위해 시청 위치를 저장한다")
    @PostMapping("/video")
    public ApiResponse<Void> saveVideoProgress(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody VideoProgressRequestDto request
    ) {
        progressService.saveVideoProgress(userId, request.getMaterialId(), request.getWatchedPosition());
        return ApiResponse.<Void>success(null, "영상 시청 위치가 저장되었습니다.");
    }

    /**
     * EDU-FR-005: 내 진도 조회
     */
    @Operation(summary = "내 진도 조회", description = "로그인한 사용자의 과정별 진도 현황을 조회한다")
    @GetMapping("/me")
    public ApiResponse<List<MyProgressResponseDto>> getMyProgress(
            @AuthenticationPrincipal Long userId
    ) {
        List<MyProgressResponseDto> response = progressService.getMyProgress(userId);
        return ApiResponse.success(response);
    }
}
