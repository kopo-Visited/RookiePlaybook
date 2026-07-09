package com.visited.www.inquiry.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.inquiry.dto.request.InquiryAnswerRequestDto;
import com.visited.www.inquiry.dto.response.InquiryResponseDto;
import com.visited.www.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    @GetMapping
    public ApiResponse<List<InquiryResponseDto>> getInquiries() {
        return ApiResponse.success(inquiryService.getAllInquiries());
    }

    @GetMapping("/{inquiryId}")
    public ApiResponse<InquiryResponseDto> getInquiry(@PathVariable Long inquiryId) {
        return ApiResponse.success(inquiryService.getInquiry(inquiryId));
    }

    @PatchMapping("/{inquiryId}/answer")
    public ApiResponse<InquiryResponseDto> answer(
            @PathVariable Long inquiryId,
            @Valid @RequestBody InquiryAnswerRequestDto request
    ) {
        return ApiResponse.success(inquiryService.answer(inquiryId, request), "답변이 등록되었습니다.");
    }
}
