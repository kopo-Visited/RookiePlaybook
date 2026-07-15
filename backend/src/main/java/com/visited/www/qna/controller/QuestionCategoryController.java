package com.visited.www.qna.controller;

import com.visited.www.qna.dto.response.QuestionCategoryResponseDto;
import com.visited.www.qna.service.QuestionCategoryService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/question-categories")
@RequiredArgsConstructor
@Tag(name = "QuestionCategory", description = "질문 카테고리 조회 API (공용) — QNA-API-006")
public class QuestionCategoryController {

    private final QuestionCategoryService questionCategoryService;

    // TODO: Security merge 후 includeInactive=true는 ADMIN만 허용하도록 제한

    @Operation(summary = "질문 카테고리 목록 조회",
            description = "노출 순서(sortOrder)대로 조회. 기본은 활성 카테고리만, includeInactive=true면 비활성 포함(관리자용)")
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, List<QuestionCategoryResponseDto>>>> getCategories(
            @Parameter(description = "비활성 포함 여부 (기본 false)")
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        List<QuestionCategoryResponseDto> categories =
                questionCategoryService.getCategories(includeInactive);
        return ResponseEntity.ok(ApiResponse.success(Map.of("categories", categories)));
    }
}
