package com.visited.www.edu.service;

import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.dto.response.StageMaterialResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EducationService {

    // EDU-FR-001: 교육 과정 목록 조회
    Page<EducationListResponseDto> getEducations(Long userId, Pageable pageable);

    // EDU-FR-002: 교육 과정 상세 조회 (단계 목록 포함)
    EducationDetailResponseDto getEducationDetail(Long userId, Long educationId);

    // EDU-FR-003: 단계 자료 조회 (이어보기 위치 포함)
    StageMaterialResponseDto getStageMaterial(Long userId, Long stageId);
}
