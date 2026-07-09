package com.visited.www.edu.controller;

import com.visited.www.edu.StageInUseException;
import com.visited.www.edu.StageNotFoundException;
import com.visited.www.edu.dto.response.StageCreateResponseDto;
import com.visited.www.edu.service.EducationService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminStageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EducationService educationService;

    private Authentication adminAuth() {
        return new UsernamePasswordAuthenticationToken(
                1L, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }

    private Authentication userAuth() {
        return new UsernamePasswordAuthenticationToken(
                2L, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    private static final String CREATE_JSON = """
            {
              "educationId": 1,
              "title": "새 단계",
              "description": "설명",
              "orderNumber": 2,
              "videoTitle": "영상 제목",
              "videoUrl": "https://videos.example.com/x.mp4"
            }
            """;

    // ==================== EDU-FR-008: 단계 등록 ====================

    @Test
    @DisplayName("POST /api/admin/stages - 단계 등록 성공(관리자)")
    void createStage_success() throws Exception {
        // given
        given(educationService.createStage(any()))
                .willReturn(new StageCreateResponseDto(20L, "새 단계"));

        // when & then
        mockMvc.perform(post("/api/admin/stages")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stageId").value(20L))
                .andExpect(jsonPath("$.data.title").value("새 단계"))
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/admin/stages - 필수값 누락 시 400 반환")
    void createStage_validation() throws Exception {
        // when & then (title/videoTitle/videoUrl 누락)
        mockMvc.perform(post("/api/admin/stages")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"educationId\": 1, \"orderNumber\": 2}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/admin/stages - 일반 사용자면 403 반환")
    void createStage_forbidden() throws Exception {
        // when & then
        mockMvc.perform(post("/api/admin/stages")
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_JSON))
                .andExpect(status().isForbidden())
                .andDo(print());
    }

    // ==================== EDU-FR-008: 단계 수정 ====================

    @Test
    @DisplayName("PUT /api/admin/stages/{id} - 존재하지 않는 단계면 404 반환")
    void updateStage_notFound() throws Exception {
        // given
        willThrow(new StageNotFoundException())
                .given(educationService).updateStage(eq(999L), any());

        // when & then
        mockMvc.perform(put("/api/admin/stages/{stageId}", 999L)
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "수정",
                                  "orderNumber": 1,
                                  "videoTitle": "영상",
                                  "videoUrl": "https://videos.example.com/y.mp4"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }

    // ==================== EDU-FR-008: 단계 삭제 ====================

    @Test
    @DisplayName("DELETE /api/admin/stages/{id} - 완료/시청 진도가 있으면 409 반환")
    void deleteStage_inUse() throws Exception {
        // given
        willThrow(new StageInUseException())
                .given(educationService).deleteStage(1L);

        // when & then
        mockMvc.perform(delete("/api/admin/stages/{stageId}", 1L)
                        .with(authentication(adminAuth())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }

    @Test
    @DisplayName("DELETE /api/admin/stages/{id} - 삭제 성공(관리자)")
    void deleteStage_success() throws Exception {
        // when & then (void 서비스라 별도 stub 불필요)
        mockMvc.perform(delete("/api/admin/stages/{stageId}", 1L)
                        .with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andDo(print());
    }
}
