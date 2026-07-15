package com.visited.www.qna.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import com.visited.www.qna.dto.request.QuestionCreateRequestDto;
import com.visited.www.qna.dto.request.QuestionUpdateRequestDto;
import com.visited.www.qna.dto.response.QuestionCreateResponseDto;
import com.visited.www.qna.dto.response.QuestionDetailResponseDto;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.entity.QuestionCategory;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.exception.InactiveCategoryException;
import com.visited.www.qna.exception.QuestionAccessDeniedException;
import com.visited.www.qna.exception.QuestionNotEditableException;
import com.visited.www.qna.exception.QuestionNotFoundException;
import com.visited.www.qna.repository.AnswerRepository;
import com.visited.www.qna.repository.QuestionCategoryRepository;
import com.visited.www.qna.repository.QuestionRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @InjectMocks
    private QuestionServiceImpl questionService;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private QuestionCategoryRepository questionCategoryRepository;

    @Mock
    private AutoFaqPromoter autoFaqPromoter;

    @Mock
    private AiCategoryClassifier aiCategoryClassifier;

    private QuestionCategory activeCategory() {
        QuestionCategory category = QuestionCategory.builder()
                .name("IT/시스템")
                .description("사내 시스템, 장비 관련 문의")
                .sortOrder(1)
                .build();
        ReflectionTestUtils.setField(category, "id", 1L);
        return category;
    }

    private Question question(Long id, Long userId) {
        Question question = Question.builder()
                .userId(userId)
                .category(activeCategory())
                .title("VPN 접속이 안 됩니다.")
                .content("재택근무 중 VPN 연결이 계속 끊깁니다.")
                .build();
        ReflectionTestUtils.setField(question, "id", id);
        return question;
    }

    private QuestionCreateRequestDto request(Long categoryId, String title, String content) {
        QuestionCreateRequestDto request = new QuestionCreateRequestDto();
        ReflectionTestUtils.setField(request, "categoryId", categoryId);
        ReflectionTestUtils.setField(request, "title", title);
        ReflectionTestUtils.setField(request, "content", content);
        return request;
    }

    private QuestionUpdateRequestDto updateRequest(Long categoryId, String title, String content) {
        QuestionUpdateRequestDto request = new QuestionUpdateRequestDto();
        ReflectionTestUtils.setField(request, "categoryId", categoryId);
        ReflectionTestUtils.setField(request, "title", title);
        ReflectionTestUtils.setField(request, "content", content);
        return request;
    }

    @Test
    @DisplayName("질문을 등록하면 RECEIVED 상태로 저장되고 questionId를 반환한다")
    void createQuestion_success() {
        // given
        given(questionCategoryRepository.findById(1L)).willReturn(Optional.of(activeCategory()));
        given(questionRepository.save(any(Question.class))).willReturn(question(10L, 100L));

        // when
        QuestionCreateResponseDto result = questionService.createQuestion(
                100L, request(1L, "VPN 접속이 안 됩니다.", "재택근무 중 VPN 연결이 계속 끊깁니다."));

        // then
        assertThat(result.questionId()).isEqualTo(10L);
        assertThat(result.status()).isEqualTo(QuestionStatus.RECEIVED);
    }

    @Test
    @DisplayName("비활성 카테고리로 질문을 등록하면 InactiveCategoryException이 발생한다")
    void createQuestion_inactiveCategory() {
        // given
        QuestionCategory inactive = activeCategory();
        inactive.deactivate();
        given(questionCategoryRepository.findById(1L)).willReturn(Optional.of(inactive));

        // when & then
        assertThatThrownBy(() -> questionService.createQuestion(100L, request(1L, "제목", "내용")))
                .isInstanceOf(InactiveCategoryException.class);
    }

    @Test
    @DisplayName("작성자 본인이 질문을 조회하면 상세 정보를 반환한다")
    void getQuestion_success() {
        // given
        given(questionRepository.findById(10L)).willReturn(Optional.of(question(10L, 100L)));
        given(answerRepository.findByQuestionId(10L)).willReturn(Optional.empty());

        // when
        QuestionDetailResponseDto result = questionService.getQuestion(100L, 10L);

        // then
        assertThat(result.questionId()).isEqualTo(10L);
        assertThat(result.status()).isEqualTo(QuestionStatus.RECEIVED);
        assertThat(result.answer()).isNull();
    }

    @Test
    @DisplayName("작성자가 아닌 사용자가 질문을 조회하면 QuestionAccessDeniedException이 발생한다")
    void getQuestion_accessDenied() {
        // given
        given(questionRepository.findById(10L)).willReturn(Optional.of(question(10L, 100L)));

        // when & then
        assertThatThrownBy(() -> questionService.getQuestion(200L, 10L))
                .isInstanceOf(QuestionAccessDeniedException.class);
    }

    @Test
    @DisplayName("존재하지 않는 질문을 조회하면 QuestionNotFoundException이 발생한다")
    void getQuestion_notFound() {
        // given
        given(questionRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> questionService.getQuestion(100L, 999L))
                .isInstanceOf(QuestionNotFoundException.class);
    }

    @Test
    @DisplayName("RECEIVED 상태의 본인 질문은 수정할 수 있다")
    void updateQuestion_success() {
        // given
        Question question = question(10L, 100L);
        given(questionRepository.findById(10L)).willReturn(Optional.of(question));
        given(questionCategoryRepository.findById(1L)).willReturn(Optional.of(activeCategory()));

        // when
        questionService.updateQuestion(100L, 10L, updateRequest(1L, "VPN 접속 오류 문의", "10분마다 끊깁니다."));

        // then
        assertThat(question.getTitle()).isEqualTo("VPN 접속 오류 문의");
    }

    @Test
    @DisplayName("RECEIVED 상태가 아닌 질문을 수정하면 QuestionNotEditableException이 발생한다")
    void updateQuestion_notEditable() {
        // given
        Question question = question(10L, 100L);
        question.changeStatus(QuestionStatus.ANSWERED);
        given(questionRepository.findById(10L)).willReturn(Optional.of(question));

        // when & then
        assertThatThrownBy(() -> questionService.updateQuestion(100L, 10L, updateRequest(1L, "제목", "내용")))
                .isInstanceOf(QuestionNotEditableException.class);
    }

    @Test
    @DisplayName("RECEIVED 상태의 본인 질문을 삭제하면 논리 삭제가 호출된다")
    void deleteQuestion_success() {
        // given
        Question question = question(10L, 100L);
        given(questionRepository.findById(10L)).willReturn(Optional.of(question));

        // when
        questionService.deleteQuestion(100L, 10L);

        // then
        then(questionRepository).should().delete(question);
    }
}
