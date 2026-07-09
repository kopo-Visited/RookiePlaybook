package com.visited.www.notice.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.notice.dto.response.NoticeResponseDto;
import com.visited.www.notice.service.NoticeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ApiResponse<List<NoticeResponseDto>> getRecentNotices() {
        return ApiResponse.success(noticeService.getRecentNotices());
    }
}
