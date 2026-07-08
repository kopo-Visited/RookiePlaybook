package com.visited.www.qna.service;

import com.visited.www.qna.dto.request.QuestionCategoryCreateRequestDto;
import com.visited.www.qna.dto.request.QuestionCategoryUpdateRequestDto;
import com.visited.www.qna.dto.response.QuestionCategoryResponseDto;
import java.util.List;

public interface QuestionCategoryService {

    List<QuestionCategoryResponseDto> getCategories(boolean includeInactive);

    Long createCategory(QuestionCategoryCreateRequestDto request);

    void updateCategory(Long categoryId, QuestionCategoryUpdateRequestDto request);

    void deleteCategory(Long categoryId);
}
