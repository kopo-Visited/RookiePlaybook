package com.visited.www.edu.repository;

import com.visited.www.edu.entity.Education;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationRepository extends JpaRepository<Education, Long> {

    // EDU-API-001: 교육 과정 목록 조회 (페이지네이션)
    Page<Education> findAll(Pageable pageable);
}
