package com.visited.www.qna.controller;

import com.visited.www.qna.dto.request.QuestionCreateRequestDto;
import com.visited.www.qna.dto.request.QuestionUpdateRequestDto;
import com.visited.www.qna.dto.response.QuestionCreateResponseDto;
import com.visited.www.qna.dto.response.QuestionDetailResponseDto;
import com.visited.www.qna.dto.response.QuestionListResponseDto;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.service.QuestionService;
import com.visited.www.global.response.ApiResponse;
import com.visited.www.global.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Tag(name = "Question", description = "질문 API (사용자) — QNA-API-001~005")
public class QuestionController {

    private final QuestionService questionService;

    @Operation(summary = "질문 등록", description = "등록 시 상태는 RECEIVED로 설정된다")
    @PostMapping
    public ResponseEntity<ApiResponse<QuestionCreateResponseDto>> createQuestion(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody QuestionCreateRequestDto request) {
        QuestionCreateResponseDto data = questionService.createQuestion(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "질문이 등록되었습니다."));
    }

    @Operation(summary = "내 질문 목록 조회", description = "최신순, 상태/카테고리 필터와 페이징 지원")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<QuestionListResponseDto>>> getMyQuestions(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "질문 상태 필터") @RequestParam(required = false) QuestionStatus status,
            @Parameter(description = "카테고리 필터") @RequestParam(required = false) Long categoryId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                questionService.getMyQuestions(userId, status, categoryId, pageable)));
    }

    @Operation(summary = "질문 상세 조회", description = "본인 질문의 상세 내용과 상태, 답변을 조회한다")
    @GetMapping("/{questionId}")
    public ResponseEntity<ApiResponse<QuestionDetailResponseDto>> getQuestion(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long questionId) {
        return ResponseEntity.ok(ApiResponse.success(
                questionService.getQuestion(userId, questionId)));
    }

    @Operation(summary = "질문 수정", description = "RECEIVED 상태의 본인 질문만 수정할 수 있다")
    @PutMapping("/{questionId}")
    public ResponseEntity<ApiResponse<Map<String, Long>>> updateQuestion(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long questionId,
            @Valid @RequestBody QuestionUpdateRequestDto request) {
        questionService.updateQuestion(userId, questionId, request);
        return ResponseEntity.ok(
                ApiResponse.success(Map.of("questionId", questionId), "질문이 수정되었습니다."));
    }

    @Operation(summary = "질문 삭제", description = "RECEIVED 상태의 본인 질문을 논리 삭제한다")
    @DeleteMapping("/{questionId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long questionId) {
        questionService.deleteQuestion(userId, questionId);
        return ResponseEntity.ok(ApiResponse.success(null, "질문이 삭제되었습니다."));
    }
}
