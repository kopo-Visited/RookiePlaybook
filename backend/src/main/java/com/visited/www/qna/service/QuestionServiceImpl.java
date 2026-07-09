package com.visited.www.qna.service;

import com.visited.www.qna.dto.request.QuestionCreateRequestDto;
import com.visited.www.qna.dto.request.QuestionUpdateRequestDto;
import com.visited.www.qna.dto.response.QuestionCreateResponseDto;
import com.visited.www.qna.dto.response.QuestionDetailResponseDto;
import com.visited.www.qna.dto.response.QuestionListResponseDto;
import com.visited.www.qna.dto.response.PublicQuestionListResponseDto;
import com.visited.www.qna.dto.response.PublicQuestionDetailResponseDto;
import com.visited.www.qna.entity.Answer;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.entity.QuestionCategory;
import com.visited.www.entity.User;
import com.visited.www.user.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.exception.InactiveCategoryException;
import com.visited.www.qna.exception.QuestionAccessDeniedException;
import com.visited.www.qna.exception.QuestionCategoryNotFoundException;
import com.visited.www.qna.exception.QuestionNotEditableException;
import com.visited.www.qna.exception.QuestionNotFoundException;
import com.visited.www.qna.repository.AnswerRepository;
import com.visited.www.qna.repository.QuestionCategoryRepository;
import com.visited.www.qna.repository.QuestionRepository;
import com.visited.www.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuestionCategoryRepository questionCategoryRepository;
    private final UserRepository userRepository;
    private final AiCategoryClassifier aiCategoryClassifier;

    @Override
    @Transactional
    public QuestionCreateResponseDto createQuestion(Long userId, QuestionCreateRequestDto request) {
        QuestionCategory category = findActiveCategory(request.getCategoryId());

        Question question = Question.builder()
                .userId(userId)
                .category(category)
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        Question saved = questionRepository.save(question);
        log.info("질문 등록. questionId={}, userId={}", saved.getId(), userId);

        // AI가 내용 기반으로 카테고리를 한 번 더 확인(제안만, 실패 시 null)
        List<String> categoryNames = questionCategoryRepository.findAll().stream()
                .map(QuestionCategory::getName).toList();
        String aiSuggested = aiCategoryClassifier.suggest(
                request.getTitle(), request.getContent(), categoryNames);
        return QuestionCreateResponseDto.of(saved, category.getName(), aiSuggested);
    }

    @Override
    public PageResponse<QuestionListResponseDto> getMyQuestions(
            Long userId, QuestionStatus status, Long categoryId, Pageable pageable) {
        Page<Question> questions;
        if (status != null && categoryId != null) {
            questions = questionRepository.findAllByUserIdAndStatusAndCategoryId(
                    userId, status, categoryId, pageable);
        } else if (status != null) {
            questions = questionRepository.findAllByUserIdAndStatus(userId, status, pageable);
        } else if (categoryId != null) {
            questions = questionRepository.findAllByUserIdAndCategoryId(userId, categoryId, pageable);
        } else {
            questions = questionRepository.findAllByUserId(userId, pageable);
        }
        return PageResponse.of(questions, QuestionListResponseDto::from);
    }

    @Override
    public QuestionDetailResponseDto getQuestion(Long userId, Long questionId) {
        Question question = findMyQuestion(userId, questionId);
        Answer answer = answerRepository.findByQuestionId(questionId).orElse(null);
        return QuestionDetailResponseDto.of(question, answer);
    }

    @Override
    public PageResponse<PublicQuestionListResponseDto> getAllQuestions(Pageable pageable) {
        Page<Question> page = questionRepository.findAll(pageable);
        List<Long> userIds = page.getContent().stream()
                .map(Question::getUserId).distinct().toList();
        Map<Long, User> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        return PageResponse.of(page, question -> {
            User writer = users.get(question.getUserId());
            return PublicQuestionListResponseDto.from(
                    question, writer == null ? null : writer.getName());
        });
    }

    @Override
    public PublicQuestionDetailResponseDto getPublicQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new QuestionNotFoundException(questionId));
        Answer answer = answerRepository.findByQuestionId(questionId).orElse(null);
        String writerName = userRepository.findById(question.getUserId())
                .map(User::getName).orElse(null);
        return PublicQuestionDetailResponseDto.of(question, answer, writerName);
    }

    @Override
    @Transactional
    public void updateQuestion(Long userId, Long questionId, QuestionUpdateRequestDto request) {
        Question question = findMyQuestion(userId, questionId);
        if (!question.isEditable()) {
            throw QuestionNotEditableException.forUpdate();
        }
        QuestionCategory category = findActiveCategory(request.getCategoryId());
        question.update(category, request.getTitle(), request.getContent());
        log.info("질문 수정. questionId={}, userId={}", questionId, userId);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long userId, Long questionId) {
        Question question = findMyQuestion(userId, questionId);
        if (!question.isEditable()) {
            throw QuestionNotEditableException.forDelete();
        }
        questionRepository.delete(question);  // @SQLDelete로 논리 삭제
        log.info("질문 삭제(논리). questionId={}, userId={}", questionId, userId);
    }

    private Question findMyQuestion(Long userId, Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new QuestionNotFoundException(questionId));
        if (!question.isWriter(userId)) {
            throw new QuestionAccessDeniedException();
        }
        return question;
    }


    private QuestionCategory findActiveCategory(Long categoryId) {
        QuestionCategory category = questionCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new QuestionCategoryNotFoundException(categoryId));
        if (!category.isActive()) {
            throw new InactiveCategoryException(categoryId);
        }
        return category;
    }
}
