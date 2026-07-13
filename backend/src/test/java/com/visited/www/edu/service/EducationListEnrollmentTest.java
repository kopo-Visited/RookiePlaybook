package com.visited.www.edu.service;

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
 * 이슈 #328 회귀 테스트 — 교육 목록에서 미수강 과정이 '수강중'으로 표시되던 버그 방지.
 *
 * 과거 findProgressByUserIdAndEducationIds가 educations 기준 LEFT JOIN + COALESCE라
 * 수강 기록이 없어도 NOT_STARTED 행을 반환해 enrolled가 항상 true가 됐다.
 * education_progress 기준 조회로 바꿔 미수강 과정은 enrolled=false가 되는지 검증한다.
 */
@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("교육 목록 조회 - 수강 여부 판정 (이슈 #328)")
class EducationListEnrollmentTest {

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
    @DisplayName("수강 기록이 없는 과정은 enrolled=false로 반환된다")
    void getEducations_notEnrolled_returnsEnrolledFalse() {
        // given — 사용자2가 교육1에 대해 수강 기록이 없도록 보장
        educationProgressRepository.findByUserIdAndEducationId(USER_ID, EDUCATION_ID)
                .ifPresent(educationProgressRepository::delete);
        educationProgressRepository.flush();

        // when
        Page<EducationListResponseDto> result =
                educationService.getEducations(USER_ID, PageRequest.of(0, 100));

        // then
        EducationListResponseDto edu1 = findEducation(result, EDUCATION_ID);
        assertThat(edu1.enrolled()).isFalse();
        assertThat(edu1.isCompleted()).isFalse();
        assertThat(edu1.progressRate()).isZero();
    }

    @Test
    @DisplayName("수강 기록이 있는 과정은 enrolled=true로 반환된다")
    void getEducations_enrolled_returnsEnrolledTrue() {
        // given — 사용자2가 교육1을 수강(진행중)한 상태를 만든다
        educationProgressRepository.findByUserIdAndEducationId(USER_ID, EDUCATION_ID)
                .ifPresent(educationProgressRepository::delete);
        educationProgressRepository.flush();

        User user = userRepository.findById(USER_ID).orElseThrow();
        Education education = educationRepository.findById(EDUCATION_ID).orElseThrow();
        EducationProgress progress = EducationProgress.create(user, education);
        progress.markInProgress();
        educationProgressRepository.saveAndFlush(progress);

        // when
        Page<EducationListResponseDto> result =
                educationService.getEducations(USER_ID, PageRequest.of(0, 100));

        // then
        EducationListResponseDto edu1 = findEducation(result, EDUCATION_ID);
        assertThat(edu1.enrolled()).isTrue();
        assertThat(edu1.isCompleted()).isFalse();
    }

    private EducationListResponseDto findEducation(Page<EducationListResponseDto> page, Long educationId) {
        return page.getContent().stream()
                .filter(e -> e.educationId().equals(educationId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("교육 " + educationId + "가 목록에 없습니다."));
    }
}
