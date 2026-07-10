package com.visited.www.edu.controller;

import com.visited.www.edu.dto.request.StageCreateRequestDto;
import com.visited.www.edu.dto.request.StageUpdateRequestDto;
import com.visited.www.edu.dto.response.StageCreateResponseDto;
import com.visited.www.edu.service.EducationService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stages")
@RequiredArgsConstructor
@Tag(name = "Admin Stage", description = "관리자 교육 단계 API")
public class AdminStageController {

    private final EducationService educationService;

    /**
     * EDU-FR-008: 단계 등록 (자료 함께 생성)
     */
    @Operation(summary = "교육 단계 등록", description = "교육 과정에 단계와 자료(영상)를 등록한다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "등록 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "요청값 검증 실패"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "존재하지 않는 과정")
    })
    @PostMapping
    public ApiResponse<StageCreateResponseDto> createStage(
            @Valid @RequestBody StageCreateRequestDto request
    ) {
        StageCreateResponseDto response = educationService.createStage(request);
        return ApiResponse.success(response, "단계가 등록되었습니다.");
    }

    /**
     * EDU-FR-008: 단계 수정 (자료 함께 수정)
     */
    @Operation(summary = "교육 단계 수정", description = "교육 단계와 자료(영상) 정보를 수정한다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "요청값 검증 실패"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "존재하지 않는 단계")
    })
    @PutMapping("/{stageId}")
    public ApiResponse<Void> updateStage(
            @PathVariable Long stageId,
            @Valid @RequestBody StageUpdateRequestDto request
    ) {
        educationService.updateStage(stageId, request);
        return ApiResponse.<Void>success(null, "단계가 수정되었습니다.");
    }

    /**
     * EDU-FR-008: 단계 삭제
     */
    @Operation(summary = "교육 단계 삭제",
            description = "교육 단계를 삭제한다. 완료 이력 또는 시청 진도가 있으면 삭제할 수 없다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "삭제 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "존재하지 않는 단계"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "완료/시청 진도가 있어 삭제 불가")
    })
    @DeleteMapping("/{stageId}")
    public ApiResponse<Void> deleteStage(
            @PathVariable Long stageId
    ) {
        educationService.deleteStage(stageId);
        return ApiResponse.<Void>success(null, "단계가 삭제되었습니다.");
    }
}
