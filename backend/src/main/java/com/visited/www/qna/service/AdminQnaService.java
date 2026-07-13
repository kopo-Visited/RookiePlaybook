package com.visited.www.qna.service;

import com.visited.www.qna.dto.request.AnswerUpsertRequestDto;
import com.visited.www.qna.dto.request.FaqConversionRequestDto;
import com.visited.www.qna.dto.request.QuestionStatusUpdateRequestDto;
import com.visited.www.qna.dto.response.AdminQuestionDetailResponseDto;
import com.visited.www.qna.dto.response.AdminQuestionListResponseDto;
import com.visited.www.qna.dto.response.AnswerUpsertResponseDto;
import com.visited.www.qna.dto.response.FaqConversionResponseDto;
import com.visited.www.qna.dto.response.QuestionStatusUpdateResponseDto;
import com.visited.www.qna.dto.response.QuestionVisibilityUpdateResponseDto;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.global.response.PageResponse;
import java.time.LocalDate;
import org.springframework.data.domain.Pageable;

public interface AdminQnaService {

    PageResponse<AdminQuestionListResponseDto> searchQuestions(
            String keyword, QuestionStatus status, Long categoryId,
            LocalDate startDate, LocalDate endDate, Pageable pageable);

    AdminQuestionDetailResponseDto getQuestion(Long questionId);

    AnswerUpsertResponseDto upsertAnswer(Long adminId, Long questionId,
                                         AnswerUpsertRequestDto request);

    QuestionStatusUpdateResponseDto updateStatus(Long adminId, Long questionId,
                                                 QuestionStatusUpdateRequestDto request);

    QuestionVisibilityUpdateResponseDto updateVisibility(Long questionId, boolean isPublic);

    void deleteQuestion(Long questionId);

    FaqConversionResponseDto convertToFaq(Long adminId, Long questionId,
                                          FaqConversionRequestDto request);
}
