package com.visited.www.edu.repository;

import com.visited.www.edu.entity.Education;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EducationRepository extends JpaRepository<Education, Long> {

    // EDU-API-001: 교육 과정 목록 조회 (페이지네이션) - 관리자 전체 조회용
    Page<Education> findAll(Pageable pageable);

    // EDU-FR-001: 사용자에게 노출할 교육 과정 (해당 부서 + 공통(부서 미지정)) - 페이지네이션 유지
    @Query("SELECT e FROM Education e WHERE e.department IS NULL OR e.department.id = :departmentId")
    Page<Education> findVisibleForDepartment(@Param("departmentId") Long departmentId, Pageable pageable);
}
