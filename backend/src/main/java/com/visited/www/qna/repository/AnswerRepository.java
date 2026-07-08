package com.visited.www.qna.repository;

import com.visited.www.qna.entity.Answer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    Optional<Answer> findByQuestionId(Long questionId);

    boolean existsByQuestionId(Long questionId);
}
