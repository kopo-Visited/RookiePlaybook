package com.visited.www.qna.repository;

import com.visited.www.qna.entity.QuestionStatusHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionStatusHistoryRepository
        extends JpaRepository<QuestionStatusHistory, Long> {

    List<QuestionStatusHistory> findAllByQuestionIdOrderByCreatedAtAsc(Long questionId);
}
