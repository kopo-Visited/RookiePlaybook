package com.visited.www.qna.service;

import com.visited.www.qna.dto.request.QuestionCategoryCreateRequestDto;
import com.visited.www.qna.dto.request.QuestionCategoryUpdateRequestDto;
import com.visited.www.qna.dto.response.QuestionCategoryResponseDto;
import com.visited.www.qna.entity.QuestionCategory;
import com.visited.www.qna.enums.CategoryStatus;
import com.visited.www.qna.exception.DuplicateCategoryNameException;
import com.visited.www.qna.exception.QuestionCategoryNotFoundException;
import com.visited.www.qna.repository.QuestionCategoryRepository;
import com.visited.www.qna.repository.QuestionRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionCategoryServiceImpl implements QuestionCategoryService {

    private final QuestionCategoryRepository questionCategoryRepository;
    private final QuestionRepository questionRepository;

    @Override
    public List<QuestionCategoryResponseDto> getCategories(boolean includeInactive) {
        List<QuestionCategory> categories = includeInactive
                ? questionCategoryRepository.findAllByOrderBySortOrderAsc()
                : questionCategoryRepository.findAllByStatusOrderBySortOrderAsc(CategoryStatus.ACTIVE);
        return categories.stream()
                .map(QuestionCategoryResponseDto::from)
                .toList();
    }

    @Override
    @Transactional
    public Long createCategory(QuestionCategoryCreateRequestDto request) {
        if (questionCategoryRepository.existsByName(request.getName())) {
            throw new DuplicateCategoryNameException(request.getName());
        }
        QuestionCategory category = QuestionCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .sortOrder(request.getSortOrder())
                .build();
        Long id = questionCategoryRepository.save(category).getId();
        log.info("질문 카테고리 등록. categoryId={}, name={}", id, request.getName());
        return id;
    }

    @Override
    @Transactional
    public void updateCategory(Long categoryId, QuestionCategoryUpdateRequestDto request) {
        QuestionCategory category = findCategory(categoryId);
        if (questionCategoryRepository.existsByNameAndIdNot(request.getName(), categoryId)) {
            throw new DuplicateCategoryNameException(request.getName());
        }
        category.update(request.getName(), request.getDescription(),
                request.getSortOrder(), request.getIsActive());
        log.info("질문 카테고리 수정. categoryId={}", categoryId);
    }

    /**
     * 질문에서 사용 중인 카테고리는 물리 삭제하지 않고 INACTIVE 처리한다 (QNA-API-016).
     */
    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        QuestionCategory category = findCategory(categoryId);
        if (questionRepository.existsByCategoryId(categoryId)) {
            category.deactivate();
            log.info("질문 카테고리 비활성화(사용 중). categoryId={}", categoryId);
            return;
        }
        questionCategoryRepository.delete(category);
        log.info("질문 카테고리 삭제. categoryId={}", categoryId);
    }

    private QuestionCategory findCategory(Long categoryId) {
        return questionCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new QuestionCategoryNotFoundException(categoryId));
    }
}
