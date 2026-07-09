package com.visited.www.edu.controller;

import com.visited.www.edu.dto.response.AdminProgressResponseDto;
import com.visited.www.edu.dto.response.IncompleteResponseDto;
import com.visited.www.edu.service.EducationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminProgressControllerTest {

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

    // ==================== EDU-FR-009: 관리자 진도 현황 조회 ====================

    @Test
    @DisplayName("GET /api/admin/progress - 진도 현황 조회 성공(관리자)")
    void getAdminProgress_success() throws Exception {
        // given
        AdminProgressResponseDto dto = new AdminProgressResponseDto(
                2L, "홍길동", "개발팀", "백엔드 기초 교육", 100, true,
                LocalDateTime.of(2026, 7, 9, 9, 0));
        Page<AdminProgressResponseDto> page =
                new PageImpl<>(List.of(dto), PageRequest.of(0, 20), 1);

        given(educationService.getAdminProgress(any(), any(), any(), any()))
                .willReturn(page);

        // when & then
        mockMvc.perform(get("/api/admin/progress")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].userId").value(2L))
                .andExpect(jsonPath("$.data.content[0].departmentName").value("개발팀"))
                .andExpect(jsonPath("$.data.content[0].isCompleted").value(true))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andDo(print());
    }

    @Test
    @DisplayName("GET /api/admin/progress - 일반 사용자면 403 반환")
    void getAdminProgress_forbidden() throws Exception {
        // when & then
        mockMvc.perform(get("/api/admin/progress")
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andDo(print());
    }

    // ==================== EDU-FR-010: 미완료자 조회 ====================

    @Test
    @DisplayName("GET /api/admin/progress/incomplete - 미완료자 조회 성공(관리자)")
    void getIncompleteProgress_success() throws Exception {
        // given
        IncompleteResponseDto dto = new IncompleteResponseDto(
                1L, "관리자", "개발팀", "신입사원 온보딩 교육", 66, 80);
        Page<IncompleteResponseDto> page =
                new PageImpl<>(List.of(dto), PageRequest.of(0, 20), 1);

        given(educationService.getIncompleteProgress(any(), any())).willReturn(page);

        // when & then
        mockMvc.perform(get("/api/admin/progress/incomplete")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].userId").value(1L))
                .andExpect(jsonPath("$.data.content[0].progressRate").value(66))
                .andExpect(jsonPath("$.data.content[0].completionCriteria").value(80))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andDo(print());
    }

    @Test
    @DisplayName("GET /api/admin/progress/incomplete - 일반 사용자면 403 반환")
    void getIncompleteProgress_forbidden() throws Exception {
        // when & then
        mockMvc.perform(get("/api/admin/progress/incomplete")
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andDo(print());
    }
}
