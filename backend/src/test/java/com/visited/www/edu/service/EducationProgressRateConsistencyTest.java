package com.visited.www.edu.service;

import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationProgress;
import com.visited.www.edu.repository.EducationProgressRepository;
import com.visited.www.edu.repository.EducationRepository;
import com.visited.www.entity.User;
import com.visited.www.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 이슈 #407 회귀 테스트 — 교육 목록 진도율과 상세 진도율이 달라지던 버그 방지.
 *
 * 과거 목록(toListResponse)은 저장된 education_progress.progress_rate/status를 그대로 사용하고,
 * 상세(getEducationDetail)는 완료 단계 수로 실시간 계산해, 저장값이 stale하면 두 화면의 값이 어긋났다.
 * 목록도 상세와 동일하게 실시간 계산하도록 바꿔, 저장값이 stale해도 목록==상세가 유지되는지 검증한다.
 */
@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("교육 목록/상세 진도율 일치 (이슈 #407)")
class EducationProgressRateConsistencyTest {

    @Autowired
    private EducationService educationService;
    @Autowired
    private EducationProgressRepository educationProgressRepository;
    @Autowired
    private EducationRepository educationRepository;
    @Autowired
    private UserRepository userRepository;

    private static final Long USER_ID = 2L;
    private static final Long EDUCATION_ID = 1L;

    @Test
    @DisplayName("저장된 progress_rate가 stale해도 목록 진도율은 상세와 동일한 실시간 값으로 반환된다")
    void listProgressRate_ignoresStaleStoredValue_andMatchesDetail() {
        // given — 단계 완료 기록은 없는데 저장된 progress_rate/status만 100/완료로 오염(stale)된 상태를 만든다
        educationProgressRepository.findByUserIdAndEducationId(USER_ID, EDUCATION_ID)
                .ifPresent(educationProgressRepository::delete);
        educationProgressRepository.flush();

        User user = userRepository.findById(USER_ID).orElseThrow();
        Education education = educationRepository.findById(EDUCATION_ID).orElseThrow();
        EducationProgress progress = EducationProgress.create(user, education);
        progress.markInProgress();
        // 완료 단계가 하나도 없음에도 저장값만 수료(100%)로 강제 → 저장값과 실시간 계산이 어긋난 상황
        progress.updateProgress(100, education.getCompletionCriteria());
        educationProgressRepository.saveAndFlush(progress);

        // when
        Page<EducationListResponseDto> listResult =
                educationService.getEducations(USER_ID, PageRequest.of(0, 100));
        EducationListResponseDto listEdu = findEducation(listResult, EDUCATION_ID);
        EducationDetailResponseDto detailEdu =
                educationService.getEducationDetail(USER_ID, EDUCATION_ID);

        // then — 목록은 저장값(100/완료)이 아니라 실시간 값(완료 단계 0 → 0%)을 사용하고, 상세와 정확히 일치한다
        assertThat(listEdu.progressRate()).isZero();
        assertThat(listEdu.isCompleted()).isFalse();
        assertThat(listEdu.progressRate()).isEqualTo(detailEdu.progressRate());
        assertThat(listEdu.isCompleted()).isEqualTo(detailEdu.isCompleted());
    }

    private EducationListResponseDto findEducation(Page<EducationListResponseDto> page, Long educationId) {
        return page.getContent().stream()
                .filter(e -> e.educationId().equals(educationId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("교육 " + educationId + "가 목록에 없습니다."));
    }
}
