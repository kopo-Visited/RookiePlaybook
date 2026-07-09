package com.visited.www.edu.repository;

import com.visited.www.edu.entity.VideoProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {

    // 특정 유저의 특정 자료 시청 위치 조회 (이어보기)
    Optional<VideoProgress> findByUserIdAndMaterialId(Long userId, Long materialId);

    // 특정 자료에 시청 진도가 있는지 여부 (단계 삭제 시 사용중 판단용)
    boolean existsByMaterialId(Long materialId);
}
