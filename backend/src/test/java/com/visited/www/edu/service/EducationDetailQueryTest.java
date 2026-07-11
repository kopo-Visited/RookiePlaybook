package com.visited.www.edu.service;

import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.StageResponseDto;
import com.visited.www.edu.entity.EducationMaterial;
import com.visited.www.edu.entity.EducationStage;
import com.visited.www.edu.entity.StageCompletion;
import com.visited.www.edu.entity.VideoProgress;
import com.visited.www.edu.repository.EducationMaterialRepository;
import com.visited.www.edu.repository.EducationStageRepository;
import com.visited.www.edu.repository.StageCompletionRepository;
import com.visited.www.edu.repository.VideoProgressRepository;
import com.visited.www.entity.User;
import com.visited.www.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 이슈 #242 회귀 테스트 — 교육 상세 조회 시 단계 중복 반환 방지.
 *
 * 과거 findStagesWithProgressByEducationIdAndUserId가 stage_completions·video_progress를
 * LEFT JOIN하여, 해당 테이블에 (사용자 기준) 여러 행이 있으면 단계가 팬아웃(복제)됐다.
 * EXISTS/스칼라 서브쿼리로 바꿔 단계당 1행이 보장되는지, 완료여부·시청위치가 정확한지 검증한다.
 */
@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("교육 상세 조회 쿼리 - 단계 중복 방지 (이슈 #242)")
class EducationDetailQueryTest {

    @Autowired
    private EducationService educationService;
    @Autowired
    private StageCompletionRepository stageCompletionRepository;
    @Autowired
    private VideoProgressRepository videoProgressRepository;
    @Autowired
    private EducationStageRepository educationStageRepository;
    @Autowired
    private EducationMaterialRepository educationMaterialRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("완료·시청 기록이 있어도 단계가 중복 없이 반환되고 완료여부·시청위치가 정확하다")
    void getEducationDetail_noDuplicateStages_andCorrectProgress() {
        // given — 시드: 교육1(단계 1,2,3), 사용자 id=2. 단계1에 완료·시청 기록 추가
        Long userId = 2L, educationId = 1L, stageId = 1L;
        User user = userRepository.findById(userId).orElseThrow();
        EducationStage stage = educationStageRepository.findById(stageId).orElseThrow();
        EducationMaterial material = educationMaterialRepository.findByStageId(stageId).orElseThrow();

        stageCompletionRepository.saveAndFlush(StageCompletion.of(user, stage));
        videoProgressRepository.saveAndFlush(VideoProgress.create(user, material, 42));

        // when
        EducationDetailResponseDto detail = educationService.getEducationDetail(userId, educationId);

        // then — 단계 중복 없음 (단계당 1행 보장)
        List<Long> stageIds = detail.stages().stream().map(StageResponseDto::stageId).toList();
        assertThat(stageIds).doesNotHaveDuplicates();

        // 새 EXISTS/서브쿼리 형태가 완료여부·시청위치를 정확히 매핑한다
        StageResponseDto s1 = detail.stages().stream()
                .filter(s -> s.stageId().equals(stageId)).findFirst().orElseThrow();
        assertThat(s1.isCompleted()).isTrue();
        assertThat(s1.material().lastWatchedPosition()).isEqualTo(42);
    }
}
