package com.visited.www.ai.controller;

import com.visited.www.ai.service.AiService;
import com.visited.www.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AiAdminController {

    private final AiService aiService;

    @PostMapping("/index")
    public ApiResponse<Void> indexDocuments() {
        aiService.indexAllDocuments();
        return ApiResponse.success();
    }
}
