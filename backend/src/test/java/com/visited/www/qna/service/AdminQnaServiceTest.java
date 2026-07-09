package com.visited.www.qna.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import com.visited.www.qna.dto.request.AnswerUpsertRequestDto;
import com.visited.www.qna.dto.request.FaqConversionRequestDto;
import com.visited.www.qna.dto.request.QuestionStatusUpdateRequestDto;
import com.visited.www.qna.dto.response.AnswerUpsertResponseDto;
import com.visited.www.qna.entity.Answer;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.entity.QuestionCategory;
import com.visited.www.qna.entity.QuestionStatusHistory;
import com.visited.www.qna.enums.NotificationType;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.exception.FaqConversionNotAllowedException;
import com.visited.www.qna.exception.StatusChangeNotAllowedException;
import com.visited.www.qna.repository.AnswerRepository;
import com.visited.www.qna.repository.QuestionRepository;
import com.visited.www.qna.repository.QuestionStatusHistoryRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AdminQnaServiceTest {

    @InjectMocks
    private AdminQnaServiceImpl adminQnaService;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private QuestionStatusHistoryRepository statusHistoryRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private FaqCreator faqCreator;

    private Question question(Long id) {
        QuestionCategory category = QuestionCategory.builder()
                .name("IT/시스템")
                .build();
        ReflectionTestUtils.setField(category, "id", 1L);

        Question question = Question.builder()
                .userId(2L)
                .category(category)
                .title("VPN 접속이 안 됩니다.")
                .content("재택근무 중 VPN 연결이 계속 끊깁니다.")
                .build();
        ReflectionTestUtils.setField(question, "id", id);
        return question;
    }

    private AnswerUpsertRequestDto answerRequest(String content) {
        AnswerUpsertRequestDto request = new AnswerUpsertRequestDto();
        ReflectionTestUtils.setField(request, "content", content);
        return request;
    }

    @Test
    @DisplayName("답변이 없는 질문에 답변을 등록하면 ANSWERED로 변경되고 이력과 알림이 생성된다")
    void upsertAnswer_newAnswer() {
        // given
        Question question = question(10L);
        given(questionRepository.findById(10L)).willReturn(Optional.of(question));
        given(answerRepository.findByQuestionId(10L)).willReturn(Optional.empty());
        given(answerRepository.save(any(Answer.class))).willAnswer(invocation -> {
            Answer answer = invocation.getArgument(0);
            ReflectionTestUtils.setField(answer, "id", 5L);
            return answer;
        });

        // when
        AnswerUpsertResponseDto result = adminQnaService.upsertAnswer(
                1L, 10L, answerRequest("VPN 클라이언트를 최신 버전으로 업데이트해 주세요."));

        // then
        assertThat(result.answerId()).isEqualTo(5L);
        assertThat(result.isNewAnswer()).isTrue();
        assertThat(result.questionStatus()).isEqualTo(QuestionStatus.ANSWERED);
        assertThat(question.getStatus()).isEqualTo(QuestionStatus.ANSWERED);
        then(statusHistoryRepository).should().save(any(QuestionStatusHistory.class));
        then(notificationService).should().notify(question, NotificationType.ANSWER_REGISTERED);
    }

    @Test
    @DisplayName("답변이 이미 있으면 내용만 수정하고 상태는 유지된다")
    void upsertAnswer_updateExisting() {
        // given
        Question question = question(10L);
        question.changeStatus(QuestionStatus.ANSWERED);
        Answer existing = Answer.builder()
                .question(question)
                .adminId(1L)
                .content("기존 답변")
                .build();
        ReflectionTestUtils.setField(existing, "id", 5L);

        given(questionRepository.findById(10L)).willReturn(Optional.of(question));
        given(answerRepository.findByQuestionId(10L)).willReturn(Optional.of(existing));

        // when
        AnswerUpsertResponseDto result = adminQnaService.upsertAnswer(
                1L, 10L, answerRequest("수정된 답변"));

        // then
        assertThat(result.isNewAnswer()).isFalse();
        assertThat(existing.getContent()).isEqualTo("수정된 답변");
        then(statusHistoryRepository).shouldHaveNoInteractions();
        then(notificationService).shouldHaveNoInteractions();
    }

    @Test
    @DisplayName("답변이 없는 질문을 ANSWERED로 변경하면 StatusChangeNotAllowedException(409)이 발생한다")
    void updateStatus_answeredWithoutAnswer() {
        // given
        given(questionRepository.findById(10L)).willReturn(Optional.of(question(10L)));
        given(answerRepository.existsByQuestionId(10L)).willReturn(false);

        QuestionStatusUpdateRequestDto request = new QuestionStatusUpdateRequestDto();
        ReflectionTestUtils.setField(request, "status", QuestionStatus.ANSWERED);

        // when & then
        assertThatThrownBy(() -> adminQnaService.updateStatus(1L, 10L, request))
                .isInstanceOf(StatusChangeNotAllowedException.class);
    }

    @Test
    @DisplayName("현재와 동일한 상태로 변경하면 StatusChangeNotAllowedException(409)이 발생한다")
    void updateStatus_sameStatus() {
        // given
        given(questionRepository.findById(10L)).willReturn(Optional.of(question(10L)));

        QuestionStatusUpdateRequestDto request = new QuestionStatusUpdateRequestDto();
        ReflectionTestUtils.setField(request, "status", QuestionStatus.RECEIVED);

        // when & then
        assertThatThrownBy(() -> adminQnaService.updateStatus(1L, 10L, request))
                .isInstanceOf(StatusChangeNotAllowedException.class);
    }

    @Test
    @DisplayName("상태를 보류로 변경하면 상태가 바뀌고 이력과 알림이 생성된다")
    void updateStatus_success() {
        // given
        Question question = question(10L);
        given(questionRepository.findById(10L)).willReturn(Optional.of(question));

        QuestionStatusUpdateRequestDto request = new QuestionStatusUpdateRequestDto();
        ReflectionTestUtils.setField(request, "status", QuestionStatus.ON_HOLD);
        ReflectionTestUtils.setField(request, "memo", "담당 부서 확인 필요");

        // when
        adminQnaService.updateStatus(1L, 10L, request);

        // then
        assertThat(question.getStatus()).isEqualTo(QuestionStatus.ON_HOLD);
        then(statusHistoryRepository).should().save(any(QuestionStatusHistory.class));
        then(notificationService).should().notify(question, NotificationType.STATUS_CHANGED);
    }

    @Test
    @DisplayName("ANSWERED 상태가 아닌 질문을 FAQ로 전환하면 FaqConversionNotAllowedException(409)이 발생한다")
    void convertToFaq_notAnswered() {
        // given
        given(questionRepository.findById(10L)).willReturn(Optional.of(question(10L)));

        FaqConversionRequestDto request = new FaqConversionRequestDto();
        ReflectionTestUtils.setField(request, "faqCategoryId", 2L);
        ReflectionTestUtils.setField(request, "question", "VPN 접속이 안 될 때는 어떻게 하나요?");
        ReflectionTestUtils.setField(request, "answer", "VPN 클라이언트를 업데이트해 주세요.");

        // when & then
        assertThatThrownBy(() -> adminQnaService.convertToFaq(1L, 10L, request))
                .isInstanceOf(FaqConversionNotAllowedException.class);
    }

    @Test
    @DisplayName("ANSWERED 상태의 질문을 FAQ로 전환하면 FaqCreator가 호출되고 converted_faq_id가 저장된다")
    void convertToFaq_success() {
        // given
        Question question = question(10L);
        question.changeStatus(QuestionStatus.ANSWERED);
        given(questionRepository.findById(10L)).willReturn(Optional.of(question));
        given(faqCreator.createFaq(eq(2L), any(), any())).willReturn(7L);

        FaqConversionRequestDto request = new FaqConversionRequestDto();
        ReflectionTestUtils.setField(request, "faqCategoryId", 2L);
        ReflectionTestUtils.setField(request, "question", "VPN 접속이 안 될 때는 어떻게 하나요?");
        ReflectionTestUtils.setField(request, "answer", "VPN 클라이언트를 업데이트해 주세요.");

        // when
        var result = adminQnaService.convertToFaq(1L, 10L, request);

        // then
        assertThat(result.faqId()).isEqualTo(7L);
        assertThat(question.getConvertedFaqId()).isEqualTo(7L);
    }

    @Test
    @DisplayName("이미 전환된 질문을 다시 FAQ로 전환하면 FaqConversionNotAllowedException(409)이 발생한다")
    void convertToFaq_alreadyConverted() {
        // given
        Question question = question(10L);
        question.changeStatus(QuestionStatus.ANSWERED);
        question.convertToFaq(7L);
        given(questionRepository.findById(10L)).willReturn(Optional.of(question));

        FaqConversionRequestDto request = new FaqConversionRequestDto();
        ReflectionTestUtils.setField(request, "faqCategoryId", 2L);
        ReflectionTestUtils.setField(request, "question", "질문");
        ReflectionTestUtils.setField(request, "answer", "답변");

        // when & then
        assertThatThrownBy(() -> adminQnaService.convertToFaq(1L, 10L, request))
                .isInstanceOf(FaqConversionNotAllowedException.class);
    }
}
