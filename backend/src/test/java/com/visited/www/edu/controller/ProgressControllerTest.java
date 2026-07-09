package com.visited.www.edu.controller;

import com.visited.www.edu.StageNotFoundException;
import com.visited.www.edu.dto.response.StageCompleteResponseDto;
import com.visited.www.edu.service.ProgressService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProgressService progressService;

    private Authentication userAuth(Long userId) {
        return new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    // ==================== EDU-FR-004: 단계 완료 처리 ====================

    @Test
    @DisplayName("POST /api/progress/stage - 단계 완료 처리 성공")
    void completeStage_success() throws Exception {
        // given
        Long userId = 1L;
        StageCompleteResponseDto response =
                new StageCompleteResponseDto(80, true, LocalDateTime.of(2026, 7, 9, 9, 0));

        given(progressService.completeStage(eq(userId), eq(1L))).willReturn(response);

        // when & then
        mockMvc.perform(post("/api/progress/stage")
                        .with(authentication(userAuth(userId)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stageId\": 1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.data.progressRate").value(80))
                .andExpect(jsonPath("$.data.isCompleted").value(true))
                .andExpect(jsonPath("$.data.completedAt").exists())
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/progress/stage - stageId 누락 시 400 반환")
    void completeStage_validation() throws Exception {
        // given
        Long userId = 1L;

        // when & then
        mockMvc.perform(post("/api/progress/stage")
                        .with(authentication(userAuth(userId)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/progress/stage - 존재하지 않는 단계면 404 반환")
    void completeStage_notFound() throws Exception {
        // given
        Long userId = 1L;
        given(progressService.completeStage(eq(userId), eq(999L)))
                .willThrow(new StageNotFoundException());

        // when & then
        mockMvc.perform(post("/api/progress/stage")
                        .with(authentication(userAuth(userId)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stageId\": 999}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }
}
