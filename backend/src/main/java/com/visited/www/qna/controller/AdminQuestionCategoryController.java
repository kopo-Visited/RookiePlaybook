package com.visited.www.qna.controller;

import com.visited.www.qna.dto.request.QuestionCategoryCreateRequestDto;
import com.visited.www.qna.dto.request.QuestionCategoryUpdateRequestDto;
import com.visited.www.qna.service.QuestionCategoryService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/question-categories")
@RequiredArgsConstructor
@Tag(name = "AdminQuestionCategory", description = "질문 카테고리 관리 API (관리자) — QNA-API-014~016")
public class AdminQuestionCategoryController {

    private final QuestionCategoryService questionCategoryService;

    // TODO: Security merge 후 ROLE_ADMIN 접근 제한

    @Operation(summary = "질문 카테고리 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Long>>> createCategory(
            @Valid @RequestBody QuestionCategoryCreateRequestDto request) {
        Long categoryId = questionCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(Map.of("categoryId", categoryId), "카테고리가 등록되었습니다."));
    }

    @Operation(summary = "질문 카테고리 수정", description = "이름, 설명, 노출 순서, 사용 여부를 수정한다")
    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Map<String, Long>>> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody QuestionCategoryUpdateRequestDto request) {
        questionCategoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok(
                ApiResponse.success(Map.of("categoryId", categoryId), "카테고리가 수정되었습니다."));
    }

    @Operation(summary = "질문 카테고리 삭제",
            description = "질문에서 사용 중인 카테고리는 물리 삭제하지 않고 비활성화(INACTIVE) 처리한다")
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long categoryId) {
        questionCategoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(null, "카테고리가 삭제되었습니다."));
    }
}
