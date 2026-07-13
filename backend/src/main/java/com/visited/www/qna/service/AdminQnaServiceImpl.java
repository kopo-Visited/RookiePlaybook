package com.visited.www.qna.service;

import com.visited.www.qna.dto.request.AnswerUpsertRequestDto;
import com.visited.www.qna.dto.request.FaqConversionRequestDto;
import com.visited.www.qna.dto.request.QuestionStatusUpdateRequestDto;
import com.visited.www.qna.dto.response.AdminQuestionDetailResponseDto;
import com.visited.www.qna.dto.response.AdminQuestionListResponseDto;
import com.visited.www.qna.dto.response.AnswerUpsertResponseDto;
import com.visited.www.qna.dto.response.FaqConversionResponseDto;
import com.visited.www.qna.dto.response.QuestionStatusHistoryResponseDto;
import com.visited.www.qna.dto.response.QuestionStatusUpdateResponseDto;
import com.visited.www.qna.dto.response.QuestionVisibilityUpdateResponseDto;
import com.visited.www.qna.entity.Answer;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.entity.QuestionStatusHistory;
import com.visited.www.qna.enums.NotificationType;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.exception.FaqConversionNotAllowedException;
import com.visited.www.qna.exception.QuestionNotFoundException;
import com.visited.www.qna.exception.StatusChangeNotAllowedException;
import com.visited.www.qna.repository.AnswerRepository;
import com.visited.www.qna.repository.QuestionRepository;
import com.visited.www.qna.repository.QuestionSpecification;
import com.visited.www.qna.repository.QuestionStatusHistoryRepository;
import com.visited.www.entity.User;
import com.visited.www.user.repository.UserRepository;
import com.visited.www.global.response.PageResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminQnaServiceImpl implements AdminQnaService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuestionStatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;
    private final FaqCreator faqCreator;
    private final UserRepository userRepository;

    @Override
    public PageResponse<AdminQuestionListResponseDto> searchQuestions(
            String keyword, QuestionStatus status, Long categoryId,
            LocalDate startDate, LocalDate endDate, Pageable pageable) {
        var page = questionRepository.findAll(
                QuestionSpecification.search(keyword, status, categoryId, startDate, endDate),
                pageable);
        // 작성자 userId들을 한 번에 조회해 이름/부서 매핑 (N+1 방지)
        List<Long> userIds = page.getContent().stream()
                .map(Question::getUserId).distinct().toList();
        Map<Long, User> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        return PageResponse.of(page, question -> {
            User writer = users.get(question.getUserId());
            return AdminQuestionListResponseDto.from(question,
                    writer == null ? null : writer.getName(),
                    writer == null ? null : writer.getDepartment().getName());
        });
    }

    @Override
    public AdminQuestionDetailResponseDto getQuestion(Long questionId) {
        Question question = findQuestion(questionId);
        Answer answer = answerRepository.findByQuestionId(questionId).orElse(null);
        List<QuestionStatusHistoryResponseDto> histories =
                statusHistoryRepository.findAllByQuestionIdOrderByCreatedAtAsc(questionId).stream()
                        .map(QuestionStatusHistoryResponseDto::from)
                        .toList();
        User writer = userRepository.findById(question.getUserId()).orElse(null);
        String writerName = writer == null ? null : writer.getName();
        String departmentName = writer == null ? null : writer.getDepartment().getName();
        String adminName = answer == null ? null
                : userRepository.findById(answer.getAdminId()).map(User::getName).orElse(null);
        return AdminQuestionDetailResponseDto.of(
                question, answer, histories, writerName, departmentName, adminName);
    }

    /**
     * 답변 등록/수정 (QNA-API-011).
     * 답변이 없으면 신규 등록: 질문 상태 ANSWERED 변경 + 이력 기록 + 질문자 알림 생성.
     * 답변이 있으면 내용만 수정하고 상태는 유지한다.
     */
    @Override
    @Transactional
    public AnswerUpsertResponseDto upsertAnswer(Long adminId, Long questionId,
                                                AnswerUpsertRequestDto request) {
        Question question = findQuestion(questionId);
        Answer existing = answerRepository.findByQuestionId(questionId).orElse(null);

        if (existing != null) {
            existing.updateContent(request.getContent());
            log.info("답변 수정. questionId={}, answerId={}, adminId={}",
                    questionId, existing.getId(), adminId);
            return new AnswerUpsertResponseDto(existing.getId(), question.getStatus(), false);
        }

        Answer answer = answerRepository.save(Answer.builder()
                .question(question)
                .adminId(adminId)
                .content(request.getContent())
                .build());

        recordStatusChange(question, QuestionStatus.ANSWERED, adminId, "답변 등록");
        question.changeStatus(QuestionStatus.ANSWERED);
        notificationService.notify(question, NotificationType.ANSWER_REGISTERED);

        log.info("답변 등록. questionId={}, answerId={}, adminId={}",
                questionId, answer.getId(), adminId);
        return new AnswerUpsertResponseDto(answer.getId(), QuestionStatus.ANSWERED, true);
    }

    /**
     * 질문 상태 변경 (QNA-API-012).
     * 동일 상태로 변경하거나, 답변이 없는 질문을 ANSWERED로 변경하면 409.
     */
    @Override
    @Transactional
    public QuestionStatusUpdateResponseDto updateStatus(Long adminId, Long questionId,
                                                        QuestionStatusUpdateRequestDto request) {
        Question question = findQuestion(questionId);
        QuestionStatus newStatus = request.getStatus();

        if (question.getStatus() == newStatus) {
            throw new StatusChangeNotAllowedException("이미 해당 상태입니다.");
        }
        if (newStatus == QuestionStatus.ANSWERED
                && !answerRepository.existsByQuestionId(questionId)) {
            throw new StatusChangeNotAllowedException("답변이 등록되지 않은 질문은 답변완료로 변경할 수 없습니다.");
        }

        recordStatusChange(question, newStatus, adminId, request.getMemo());
        question.changeStatus(newStatus);
        notificationService.notify(question, NotificationType.STATUS_CHANGED);

        log.info("질문 상태 변경. questionId={}, status={}, adminId={}",
                questionId, newStatus, adminId);
        return new QuestionStatusUpdateResponseDto(questionId, newStatus);
    }

    /** 질문 공개/비공개 전환. 비공개면 '모든 질문'(사용자) 목록/상세에서 숨긴다. */
    @Override
    @Transactional
    public QuestionVisibilityUpdateResponseDto updateVisibility(Long questionId, boolean isPublic) {
        Question question = findQuestion(questionId);
        question.changeVisibility(isPublic);
        log.info("질문 공개여부 변경. questionId={}, isPublic={}", questionId, isPublic);
        return new QuestionVisibilityUpdateResponseDto(questionId, isPublic);
    }

    /**
     * FAQ 전환 (QNA-API-013).
     * ANSWERED 상태의 질문만 전환할 수 있고, 이미 전환된 질문은 409.
     * B모듈 faqs에 FAQ를 생성하고 converted_faq_id를 저장한다.
     */
    @Override
    @Transactional
    public FaqConversionResponseDto convertToFaq(Long adminId, Long questionId,
                                                 FaqConversionRequestDto request) {
        Question question = findQuestion(questionId);

        if (question.getStatus() != QuestionStatus.ANSWERED) {
            throw new FaqConversionNotAllowedException("답변완료(ANSWERED) 상태의 질문만 FAQ로 전환할 수 있습니다.");
        }
        if (question.isConverted()) {
            throw new FaqConversionNotAllowedException("이미 FAQ로 전환된 질문입니다.");
        }

        // TODO: B파트 FaqService merge 후 TempFaqCreator를 실제 구현으로 교체
        Long faqId = faqCreator.createFaq(
                request.getFaqCategoryId(), request.getQuestion(), request.getAnswer());
        if (faqId != null) {
            question.convertToFaq(faqId);
        }

        log.info("FAQ 전환. questionId={}, faqId={}, adminId={}", questionId, faqId, adminId);
        return new FaqConversionResponseDto(faqId, questionId);
    }

    private Question findQuestion(Long questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new QuestionNotFoundException(questionId));
    }

    private void recordStatusChange(Question question, QuestionStatus newStatus,
                                    Long adminId, String memo) {
        statusHistoryRepository.save(QuestionStatusHistory.builder()
                .question(question)
                .previousStatus(question.getStatus())
                .newStatus(newStatus)
                .changedBy(adminId)
                .memo(memo)
                .build());
    }
}
