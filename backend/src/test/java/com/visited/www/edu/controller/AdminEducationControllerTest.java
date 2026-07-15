package com.visited.www.edu.controller;

import com.visited.www.edu.EducationInUseException;
import com.visited.www.edu.EducationNotFoundException;
import com.visited.www.edu.dto.request.EducationCreateRequestDto;
import com.visited.www.edu.dto.response.EducationCreateResponseDto;
import com.visited.www.edu.service.EducationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminEducationControllerTest {

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

    // ==================== EDU-FR-007: 과정 등록 ====================

    @Test
    @DisplayName("POST /api/admin/educations - 과정 등록 성공(관리자)")
    void createEducation_success() throws Exception {
        // given
        given(educationService.createEducation(any()))
                .willReturn(new EducationCreateResponseDto(10L, "새 과정"));

        // when & then
        mockMvc.perform(post("/api/admin/educations")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"새 과정\", \"description\": \"설명\", \"completionCriteria\": 80}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.educationId").value(10L))
                .andExpect(jsonPath("$.data.title").value("새 과정"))
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/admin/educations - contentYear가 서비스로 전달된다")
    void createEducation_withContentYear() throws Exception {
        // given
        given(educationService.createEducation(any()))
                .willReturn(new EducationCreateResponseDto(11L, "2024 과정"));

        // when
        mockMvc.perform(post("/api/admin/educations")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"2024 과정\", \"completionCriteria\": 80, \"contentYear\": 2024}"))
                .andExpect(status().isOk());

        // then
        ArgumentCaptor<EducationCreateRequestDto> captor =
                ArgumentCaptor.forClass(EducationCreateRequestDto.class);
        verify(educationService).createEducation(captor.capture());
        assertThat(captor.getValue().getContentYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("POST /api/admin/educations - contentYear가 2000 미만이면 400 반환")
    void createEducation_invalidContentYear() throws Exception {
        // when & then
        mockMvc.perform(post("/api/admin/educations")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"과정\", \"completionCriteria\": 80, \"contentYear\": 1999}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/admin/educations - 제목 누락 시 400 반환")
    void createEducation_validation() throws Exception {
        // when & then
        mockMvc.perform(post("/api/admin/educations")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\": \"설명\", \"completionCriteria\": 80}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }

    @Test
    @DisplayName("POST /api/admin/educations - 일반 사용자면 403 반환")
    void createEducation_forbidden() throws Exception {
        // when & then (일반 사용자 권한으로 관리자 API 접근)
        mockMvc.perform(post("/api/admin/educations")
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"새 과정\", \"completionCriteria\": 80}"))
                .andExpect(status().isForbidden())
                .andDo(print());
    }

    // ==================== EDU-FR-007: 과정 수정 ====================

    @Test
    @DisplayName("PUT /api/admin/educations/{id} - 존재하지 않는 과정이면 404 반환")
    void updateEducation_notFound() throws Exception {
        // given
        willThrow(new EducationNotFoundException())
                .given(educationService).updateEducation(eq(999L), any());

        // when & then
        mockMvc.perform(put("/api/admin/educations/{educationId}", 999L)
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"수정\", \"completionCriteria\": 90}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }

    // ==================== EDU-FR-007: 과정 삭제 ====================

    @Test
    @DisplayName("DELETE /api/admin/educations/{id} - 단계/진도가 있으면 409 반환")
    void deleteEducation_inUse() throws Exception {
        // given
        willThrow(new EducationInUseException())
                .given(educationService).deleteEducation(1L);

        // when & then
        mockMvc.perform(delete("/api/admin/educations/{educationId}", 1L)
                        .with(authentication(adminAuth())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }

    @Test
    @DisplayName("DELETE /api/admin/educations/{id} - 삭제 성공(관리자)")
    void deleteEducation_success() throws Exception {
        // when & then (void 서비스라 별도 stub 불필요)
        mockMvc.perform(delete("/api/admin/educations/{educationId}", 1L)
                        .with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andDo(print());
    }
}
