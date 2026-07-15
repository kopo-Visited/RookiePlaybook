package com.visited.www.notice.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.notice.dto.request.NoticeCreateRequestDto;
import com.visited.www.notice.dto.request.NoticeUpdateRequestDto;
import com.visited.www.notice.dto.response.NoticeResponseDto;
import com.visited.www.notice.service.NoticeService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ApiResponse<List<NoticeResponseDto>> getNotices() {
        return ApiResponse.success(noticeService.getAllNotices());
    }

    @PostMapping
    public ApiResponse<NoticeResponseDto> createNotice(
            Authentication authentication,
            @Valid @RequestBody NoticeCreateRequestDto request
    ) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.success(noticeService.create(userId, request), "공지사항이 등록되었습니다.");
    }

    @PutMapping("/{noticeId}")
    public ApiResponse<NoticeResponseDto> updateNotice(
            @PathVariable Long noticeId,
            @Valid @RequestBody NoticeUpdateRequestDto request
    ) {
        return ApiResponse.success(noticeService.update(noticeId, request), "공지사항이 수정되었습니다.");
    }

    @DeleteMapping("/{noticeId}")
    public ApiResponse<Void> deleteNotice(@PathVariable Long noticeId) {
        noticeService.delete(noticeId);
        return ApiResponse.success(null, "공지사항이 삭제되었습니다.");
    }
}
