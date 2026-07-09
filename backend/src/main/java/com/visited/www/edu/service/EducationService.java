package com.visited.www.edu.service;

import com.visited.www.edu.dto.request.EducationCreateRequestDto;
import com.visited.www.edu.dto.request.EducationUpdateRequestDto;
import com.visited.www.edu.dto.request.StageCreateRequestDto;
import com.visited.www.edu.dto.request.StageUpdateRequestDto;
import com.visited.www.edu.dto.response.AdminProgressResponseDto;
import com.visited.www.edu.dto.response.EducationCreateResponseDto;
import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.dto.response.StageCreateResponseDto;
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

    // EDU-FR-007: 관리자 교육 과정 등록
    EducationCreateResponseDto createEducation(EducationCreateRequestDto request);

    // EDU-FR-007: 관리자 교육 과정 수정
    void updateEducation(Long educationId, EducationUpdateRequestDto request);

    // EDU-FR-007: 관리자 교육 과정 삭제 (단계/진도가 있으면 삭제 불가)
    void deleteEducation(Long educationId);

    // EDU-FR-008: 관리자 단계 등록 (자료 함께 생성)
    StageCreateResponseDto createStage(StageCreateRequestDto request);

    // EDU-FR-008: 관리자 단계 수정 (자료 함께 수정)
    void updateStage(Long stageId, StageUpdateRequestDto request);

    // EDU-FR-008: 관리자 단계 삭제 (완료/시청 진도가 있으면 삭제 불가)
    void deleteStage(Long stageId);

    // EDU-FR-009: 관리자 진도 현황 조회 (부서/과정/완료여부 필터 + 페이징)
    Page<AdminProgressResponseDto> getAdminProgress(
            Long departmentId, Long educationId, Boolean isCompleted, Pageable pageable);
}
