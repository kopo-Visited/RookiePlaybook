package com.visited.www.edu.service;

import com.visited.www.edu.dto.response.MyProgressResponseDto;
import com.visited.www.edu.dto.response.StageCompleteResponseDto;

import java.util.List;

public interface ProgressService {

    // EDU-FR-004: 단계 완료 처리
    StageCompleteResponseDto completeStage(Long userId, Long stageId);

    // EDU-FR-003: 영상 시청 위치 저장
    void saveVideoProgress(Long userId, Long materialId, Integer watchedPosition);

    // EDU-FR-005: 내 진도 조회
    List<MyProgressResponseDto> getMyProgress(Long userId);

    // 수강 시작(enroll): 진도 레코드가 없으면 진행중으로 생성 (멱등)
    void enroll(Long userId, Long educationId);
}
