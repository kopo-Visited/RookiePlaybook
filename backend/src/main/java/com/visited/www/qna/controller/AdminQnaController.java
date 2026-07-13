package com.visited.www.qna.controller;

import com.visited.www.qna.dto.request.AnswerUpsertRequestDto;
import com.visited.www.qna.dto.request.FaqConversionRequestDto;
import com.visited.www.qna.dto.request.QuestionStatusUpdateRequestDto;
import com.visited.www.qna.dto.request.QuestionVisibilityUpdateRequestDto;
import com.visited.www.qna.dto.response.AdminQuestionDetailResponseDto;
import com.visited.www.qna.dto.response.AdminQuestionListResponseDto;
import com.visited.www.qna.dto.response.AnswerUpsertResponseDto;
import com.visited.www.qna.dto.response.FaqConversionResponseDto;
import com.visited.www.qna.dto.response.QuestionStatusUpdateResponseDto;
import com.visited.www.qna.dto.response.QuestionVisibilityUpdateResponseDto;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.service.AdminQnaService;
import com.visited.www.global.response.ApiResponse;
import com.visited.www.global.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/questions")
@RequiredArgsConstructor
@Tag(name = "AdminQna", description = "질문/답변 관리 API (관리자) — QNA-API-009~013")
public class AdminQnaController {

    private final AdminQnaService adminQnaService;

    @Operation(summary = "질문 목록 관리", description = "키워드/상태/카테고리/기간 조건으로 검색한다")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminQuestionListResponseDto>>> getQuestions(
            @Parameter(description = "제목/내용 검색어") @RequestParam(required = false) String keyword,
            @Parameter(description = "질문 상태 필터") @RequestParam(required = false) QuestionStatus status,
            @Parameter(description = "카테고리 필터") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "등록일 시작 (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "등록일 종료 (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminQnaService.searchQuestions(
                keyword, status, categoryId, startDate, endDate, pageable)));
    }

    @Operation(summary = "질문 상세 확인", description = "질문자 정보, 답변, FAQ 전환 여부, 상태 변경 이력을 포함한다")
    @GetMapping("/{questionId}")
    public ResponseEntity<ApiResponse<AdminQuestionDetailResponseDto>> getQuestion(
            @PathVariable Long questionId) {
        return ResponseEntity.ok(ApiResponse.success(adminQnaService.getQuestion(questionId)));
    }

    @Operation(summary = "답변 등록/수정",
            description = "답변이 없으면 신규 등록되어 상태가 ANSWERED로 변경되고 이력 기록, 알림 생성이 함께 처리된다. 이미 있으면 내용만 수정한다")
    @PutMapping("/{questionId}/answer")
    public ResponseEntity<ApiResponse<AnswerUpsertResponseDto>> updateAnswer(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long questionId,
            @Valid @RequestBody AnswerUpsertRequestDto request) {
        AnswerUpsertResponseDto data = adminQnaService.upsertAnswer(adminId, questionId, request);
        String message = data.isNewAnswer() ? "답변이 등록되었습니다." : "답변이 수정되었습니다.";
        return ResponseEntity.ok(ApiResponse.success(data, message));
    }

    @Operation(summary = "질문 상태 변경",
            description = "변경 이력 기록과 질문자 알림 생성이 함께 처리된다. 답변이 없는 질문은 ANSWERED로 변경할 수 없다(409)")
    @PatchMapping("/{questionId}/status")
    public ResponseEntity<ApiResponse<QuestionStatusUpdateResponseDto>> updateStatus(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long questionId,
            @Valid @RequestBody QuestionStatusUpdateRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(
                adminQnaService.updateStatus(adminId, questionId, request),
                "상태가 변경되었습니다."));
    }

    @Operation(summary = "질문 공개/비공개 전환",
            description = "비공개로 전환하면 '모든 질문'(사용자) 목록/상세에서 숨겨진다")
    @PatchMapping("/{questionId}/visibility")
    public ResponseEntity<ApiResponse<QuestionVisibilityUpdateResponseDto>> updateVisibility(
            @PathVariable Long questionId,
            @Valid @RequestBody QuestionVisibilityUpdateRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(
                adminQnaService.updateVisibility(questionId, request.getIsPublic()),
                request.getIsPublic() ? "공개로 전환되었습니다." : "비공개로 전환되었습니다."));
    }

    @Operation(summary = "FAQ 전환",
            description = "ANSWERED 상태의 질문을 FAQ로 전환한다. B모듈 faqs에 FAQ가 생성되고 converted_faq_id가 저장된다")
    @PostMapping("/{questionId}/faq")
    public ResponseEntity<ApiResponse<FaqConversionResponseDto>> convertToFaq(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long questionId,
            @Valid @RequestBody FaqConversionRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(
                adminQnaService.convertToFaq(adminId, questionId, request),
                "FAQ로 전환되었습니다."));
    }
}
