package com.visited.www.edu.service;

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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 이슈 #242 — 진도/완료 기록 중복 방지(유니크 제약) 및 시청 위치 upsert 멱등성 검증.
 */
@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("교육 진도 데이터 정합성 (이슈 #242)")
class ProgressIntegrityTest {

    @Autowired
    private ProgressService progressService;
    @Autowired
    private VideoProgressRepository videoProgressRepository;
    @Autowired
    private StageCompletionRepository stageCompletionRepository;
    @Autowired
    private EducationMaterialRepository educationMaterialRepository;
    @Autowired
    private EducationStageRepository educationStageRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("같은 (user, material)로 video_progress를 2개 저장하면 유니크 제약 위반")
    void videoProgress_duplicate_violatesUniqueConstraint() {
        User user = userRepository.findById(2L).orElseThrow();
        EducationMaterial material = educationMaterialRepository.findByStageId(1L).orElseThrow();
        videoProgressRepository.saveAndFlush(VideoProgress.create(user, material, 10));

        assertThatThrownBy(() ->
                videoProgressRepository.saveAndFlush(VideoProgress.create(user, material, 20)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("같은 (user, stage)로 stage_completion을 2개 저장하면 유니크 제약 위반")
    void stageCompletion_duplicate_violatesUniqueConstraint() {
        User user = userRepository.findById(2L).orElseThrow();
        EducationStage stage = educationStageRepository.findById(1L).orElseThrow();
        stageCompletionRepository.saveAndFlush(StageCompletion.of(user, stage));

        assertThatThrownBy(() ->
                stageCompletionRepository.saveAndFlush(StageCompletion.of(user, stage)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("saveVideoProgress를 두 번 호출해도 행은 1개, 위치는 마지막 값으로 갱신된다")
    void saveVideoProgress_twice_isIdempotent() {
        Long userId = 2L;
        Long materialId = educationMaterialRepository.findByStageId(1L).orElseThrow().getId();

        progressService.saveVideoProgress(userId, materialId, 10);
        progressService.saveVideoProgress(userId, materialId, 50);

        VideoProgress vp = videoProgressRepository.findByUserIdAndMaterialId(userId, materialId)
                .orElseThrow();
        assertThat(vp.getWatchedPosition()).isEqualTo(50);
    }
}
