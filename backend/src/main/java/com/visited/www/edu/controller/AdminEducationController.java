package com.visited.www.edu.controller;

import com.visited.www.edu.dto.request.EducationCreateRequestDto;
import com.visited.www.edu.dto.request.EducationUpdateRequestDto;
import com.visited.www.edu.dto.response.EducationCreateResponseDto;
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
@RequestMapping("/api/admin/educations")
@RequiredArgsConstructor
@Tag(name = "Admin Education", description = "관리자 교육 과정 API")
public class AdminEducationController {

    private final EducationService educationService;

    /**
     * EDU-FR-007: 교육 과정 등록
     */
    @Operation(summary = "교육 과정 등록", description = "새 교육 과정을 등록한다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "등록 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "요청값 검증 실패"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음")
    })
    @PostMapping
    public ApiResponse<EducationCreateResponseDto> createEducation(
            @Valid @RequestBody EducationCreateRequestDto request
    ) {
        EducationCreateResponseDto response = educationService.createEducation(request);
        return ApiResponse.success(response, "과정이 등록되었습니다.");
    }

    /**
     * EDU-FR-007: 교육 과정 수정
     */
    @Operation(summary = "교육 과정 수정", description = "교육 과정 정보를 수정한다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "요청값 검증 실패"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "존재하지 않는 과정")
    })
    @PutMapping("/{educationId}")
    public ApiResponse<Void> updateEducation(
            @PathVariable Long educationId,
            @Valid @RequestBody EducationUpdateRequestDto request
    ) {
        educationService.updateEducation(educationId, request);
        return ApiResponse.<Void>success(null, "과정이 수정되었습니다.");
    }

    /**
     * EDU-FR-007: 교육 과정 삭제
     */
    @Operation(summary = "교육 과정 삭제",
            description = "교육 과정을 삭제한다. 단계 또는 학습 진도가 있으면 삭제할 수 없다")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "삭제 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 없음"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "존재하지 않는 과정"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "단계/진도가 있어 삭제 불가")
    })
    @DeleteMapping("/{educationId}")
    public ApiResponse<Void> deleteEducation(
            @PathVariable Long educationId
    ) {
        educationService.deleteEducation(educationId);
        return ApiResponse.<Void>success(null, "과정이 삭제되었습니다.");
    }
}
