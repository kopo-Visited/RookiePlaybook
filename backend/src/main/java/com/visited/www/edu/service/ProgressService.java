package com.visited.www.edu.service;

import com.visited.www.edu.dto.response.StageCompleteResponseDto;

public interface ProgressService {

    // EDU-FR-004: 단계 완료 처리
    StageCompleteResponseDto completeStage(Long userId, Long stageId);
}
