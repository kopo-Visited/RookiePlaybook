package com.visited.www.qna.repository;

import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import java.util.List;
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

    // '모든 질문'(사용자 공개 목록)은 관리자가 비공개 처리한 질문을 제외한다
    Page<Question> findAllByIsPublicTrue(Pageable pageable);

    boolean existsByCategoryId(Long categoryId);

    long countByStatus(QuestionStatus status);

    List<Question> findTop3ByOrderByCreatedAtDesc();
}
