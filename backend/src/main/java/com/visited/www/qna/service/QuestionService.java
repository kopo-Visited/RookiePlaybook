package com.visited.www.qna.service;

import com.visited.www.qna.dto.request.QuestionCreateRequestDto;
import com.visited.www.qna.dto.request.QuestionUpdateRequestDto;
import com.visited.www.qna.dto.response.QuestionCreateResponseDto;
import com.visited.www.qna.dto.response.QuestionDetailResponseDto;
import com.visited.www.qna.dto.response.QuestionListResponseDto;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.global.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface QuestionService {

    QuestionCreateResponseDto createQuestion(Long userId, QuestionCreateRequestDto request);

    PageResponse<QuestionListResponseDto> getMyQuestions(
            Long userId, QuestionStatus status, Long categoryId, Pageable pageable);

    QuestionDetailResponseDto getQuestion(Long userId, Long questionId);

    void updateQuestion(Long userId, Long questionId, QuestionUpdateRequestDto request);

    void deleteQuestion(Long userId, Long questionId);
}
