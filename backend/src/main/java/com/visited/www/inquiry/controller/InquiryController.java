package com.visited.www.inquiry.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.inquiry.dto.request.InquiryCreateRequestDto;
import com.visited.www.inquiry.dto.response.InquiryResponseDto;
import com.visited.www.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    public ApiResponse<InquiryResponseDto> create(
            Authentication authentication,
            @Valid @RequestBody InquiryCreateRequestDto request
    ) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.success(inquiryService.create(userId, request), "문의가 등록되었습니다.");
    }

    @GetMapping("/me")
    public ApiResponse<List<InquiryResponseDto>> getMyInquiries(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.success(inquiryService.getMyInquiries(userId));
    }

    @GetMapping("/{inquiryId}")
    public ApiResponse<InquiryResponseDto> getMyInquiry(
            Authentication authentication,
            @PathVariable Long inquiryId
    ) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.success(inquiryService.getMyInquiry(userId, inquiryId));
    }
}
