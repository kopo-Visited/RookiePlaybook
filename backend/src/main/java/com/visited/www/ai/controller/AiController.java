package com.visited.www.ai.controller;

import com.visited.www.ai.dto.AiAnswerResponse;
import com.visited.www.ai.dto.AiAskRequest;
import com.visited.www.ai.service.AiService;
import com.visited.www.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/ask")
    public ApiResponse<AiAnswerResponse> ask(@RequestBody @Valid AiAskRequest request) {
        return ApiResponse.success(aiService.ask(request));
    }
}
