package com.visited.www.qna.repository;

import com.visited.www.qna.entity.QuestionCategory;
import com.visited.www.qna.enums.CategoryStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionCategoryRepository extends JpaRepository<QuestionCategory, Long> {

    List<QuestionCategory> findAllByStatusOrderBySortOrderAsc(CategoryStatus status);

    List<QuestionCategory> findAllByOrderBySortOrderAsc();

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);
}
