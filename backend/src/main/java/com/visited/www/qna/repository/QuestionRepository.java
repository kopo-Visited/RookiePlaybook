package com.visited.www.qna.repository;

import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface QuestionRepository
        extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {

    Page<Question> findAllByUserId(Long userId, Pageable pageable);

    Page<Question> findAllByUserIdAndStatus(Long userId, QuestionStatus status, Pageable pageable);

    Page<Question> findAllByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);

    Page<Question> findAllByUserIdAndStatusAndCategoryId(
            Long userId, QuestionStatus status, Long categoryId, Pageable pageable);

    boolean existsByCategoryId(Long categoryId);

    long countByStatus(QuestionStatus status);
}
