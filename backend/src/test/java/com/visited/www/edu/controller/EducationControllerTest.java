package com.visited.www.edu.controller;

import com.visited.www.edu.MaterialNotFoundException;
import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.dto.response.StageMaterialResponseDto;
import com.visited.www.edu.service.EducationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EducationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EducationService educationService;

    // ==================== EDU-FR-001: 교육 과정 목록 조회 ====================

    @Test
    @DisplayName("GET /api/educations - 교육 과정 목록 조회 성공 (페이징)")
    void getEducations_success() throws Exception {
        // given
        Long userId = 1L;

        // @AuthenticationPrincipal Long userId 에 주입될 가짜 인증 객체
        Authentication auth = new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        EducationListResponseDto dto = new EducationListResponseDto(
                1L, "신입사원 온보딩 교육", 5, 2, 40, false, null
        );
        Page<EducationListResponseDto> mockPage = new PageImpl<>(List.of(dto), PageRequest.of(0, 10), 1);

        given(educationService.getEducations(eq(userId), any(Pageable.class)))
                .willReturn(mockPage);

        // when & then
        mockMvc.perform(get("/api/educations")
                        .with(authentication(auth))
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))             // 👈 [수정됨] $.status 대신 $.success 사용!
                .andExpect(jsonPath("$.message").exists())                // 👈 message 필드가 존재하는지도 함께 검증!
                .andExpect(jsonPath("$.data.content[0].educationId").value(1L))
                .andExpect(jsonPath("$.data.content[0].title").value("신입사원 온보딩 교육"))
                .andExpect(jsonPath("$.data.content[0].progressRate").value(40))
                .andDo(print());
    }

    // ==================== EDU-FR-002: 교육 과정 상세 조회 ====================

    @Test
    @DisplayName("GET /api/educations/{educationId} - 교육 과정 상세 조회 성공")
    void getEducationDetail_success() throws Exception {
        // given
        Long userId = 1L;
        Long educationId = 1L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        EducationDetailResponseDto mockDetail = new EducationDetailResponseDto(
                educationId, "신입사원 온보딩 교육", 80, 40, false, List.of()
        );

        given(educationService.getEducationDetail(userId, educationId))
                .willReturn(mockDetail);

        // when & then
        mockMvc.perform(get("/api/educations/{educationId}", educationId)
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.data.educationId").value(educationId))
                .andExpect(jsonPath("$.data.title").value("신입사원 온보딩 교육"))
                .andExpect(jsonPath("$.data.progressRate").value(40))
                .andExpect(jsonPath("$.data.isCompleted").value(false))
                .andDo(print());
    }

    // ==================== EDU-FR-003: 단계 자료 조회 ====================

    @Test
    @DisplayName("GET /api/stages/{stageId}/material - 단계 자료 조회 성공")
    void getStageMaterial_success() throws Exception {
        // given
        Long userId = 1L;
        Long stageId = 1L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        StageMaterialResponseDto mockMaterial = new StageMaterialResponseDto(
                1L, "회사 소개 영상", "https://youtube.com/example", 120, 600
        );

        given(educationService.getStageMaterial(userId, stageId)).willReturn(mockMaterial);

        // when & then
        mockMvc.perform(get("/api/stages/{stageId}/material", stageId)
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.materialId").value(1L))
                .andExpect(jsonPath("$.data.lastWatchedPosition").value(120))
                .andExpect(jsonPath("$.data.totalDuration").value(600))
                .andDo(print());
    }

    @Test
    @DisplayName("GET /api/stages/{stageId}/material - 존재하지 않는 자료면 404 반환")
    void getStageMaterial_notFound() throws Exception {
        // given
        Long userId = 1L;
        Long stageId = 999L;

        Authentication auth = new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        given(educationService.getStageMaterial(userId, stageId))
                .willThrow(new MaterialNotFoundException());

        // when & then
        mockMvc.perform(get("/api/stages/{stageId}/material", stageId)
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andDo(print());
    }
}