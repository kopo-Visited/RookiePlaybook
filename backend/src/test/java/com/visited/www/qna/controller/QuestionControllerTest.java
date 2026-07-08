package com.visited.www.qna.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.visited.www.qna.dto.response.QuestionCreateResponseDto;
import com.visited.www.qna.dto.response.QuestionDetailResponseDto;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.exception.QuestionNotFoundException;
import com.visited.www.qna.service.QuestionService;
import java.time.LocalDateTime;
import java.util.List;
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

@SpringBootTest
@AutoConfigureMockMvc
class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuestionService questionService;

    /** JWT 필터가 principal에 userId(Long)를 넣는 방식과 동일하게 인증 객체 구성 */
    private Authentication user(Long userId) {
        return new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    @DisplayName("POST /api/questions — 정상 등록 시 201과 questionId, RECEIVED 상태를 반환한다")
    void createQuestion_success() throws Exception {
        // given
        given(questionService.createQuestion(eq(100L), any()))
                .willReturn(new QuestionCreateResponseDto(10L, QuestionStatus.RECEIVED));

        // when & then
        mockMvc.perform(post("/api/questions")
                        .with(authentication(user(100L)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoryId": 1, "title": "VPN 접속이 안 됩니다.", "content": "재택근무 중 VPN 연결이 계속 끊깁니다."}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("질문이 등록되었습니다."))
                .andExpect(jsonPath("$.data.questionId").value(10L))
                .andExpect(jsonPath("$.data.status").value("RECEIVED"));
    }

    @Test
    @DisplayName("POST /api/questions — 제목이 비어 있으면 400을 반환한다")
    void createQuestion_invalidRequest() throws Exception {
        // when & then
        mockMvc.perform(post("/api/questions")
                        .with(authentication(user(100L)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoryId": 1, "title": "", "content": "내용"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"));
    }

    @Test
    @DisplayName("POST /api/questions — 인증 없이 요청하면 401을 반환한다")
    void createQuestion_unauthorized() throws Exception {
        // when & then
        mockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoryId": 1, "title": "제목", "content": "내용"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/questions/{id} — 존재하는 질문 조회 시 200과 상세 정보를 반환한다")
    void getQuestion_success() throws Exception {
        // given
        QuestionDetailResponseDto response = new QuestionDetailResponseDto(
                10L, "IT/시스템", "VPN 접속이 안 됩니다.", "재택근무 중 VPN 연결이 계속 끊깁니다.",
                QuestionStatus.RECEIVED, LocalDateTime.now(), null, null);
        given(questionService.getQuestion(100L, 10L)).willReturn(response);

        // when & then
        mockMvc.perform(get("/api/questions/10").with(authentication(user(100L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("VPN 접속이 안 됩니다."))
                .andExpect(jsonPath("$.data.status").value("RECEIVED"));
    }

    @Test
    @DisplayName("GET /api/questions/{id} — 존재하지 않는 질문 조회 시 404를 반환한다")
    void getQuestion_notFound() throws Exception {
        // given
        given(questionService.getQuestion(100L, 999L))
                .willThrow(new QuestionNotFoundException(999L));

        // when & then
        mockMvc.perform(get("/api/questions/999").with(authentication(user(100L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("NOT_FOUND"));
    }
}
