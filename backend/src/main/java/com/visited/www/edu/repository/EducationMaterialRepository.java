package com.visited.www.edu.repository;

import com.visited.www.edu.entity.EducationMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EducationMaterialRepository extends JpaRepository<EducationMaterial, Long> {

    // 단계 ID로 자료 조회 (단계-자료 1:1)
    Optional<EducationMaterial> findByStageId(Long stageId);
}
