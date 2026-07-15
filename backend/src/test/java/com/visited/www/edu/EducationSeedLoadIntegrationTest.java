package com.visited.www.edu;

import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationProgress;
import com.visited.www.edu.repository.EducationProgressRepository;
import com.visited.www.edu.repository.EducationRepository;
import com.visited.www.edu.service.EducationService;
import com.visited.www.edu.service.ProgressService;
import com.visited.www.entity.User;
import com.visited.www.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// content_year 컬럼 추가 후에도 H2 시드가 로드되고 목록/상세 조회가 동작하는지,
// education_progress 중복이 유니크 제약으로 막히는지 검증
@SpringBootTest
@ActiveProfiles("local")
@DisplayName("교육 시드 로드 + 조회 + 수강 통합 검증")
class EducationSeedLoadIntegrationTest {

    @Autowired
    private EducationService educationService;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private EducationProgressRepository educationProgressRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("H2 시드의 교육 과정 3건이 관리자 전체 목록 조회로 반환된다")
    void getAllEducations_returnsSeededCourses() {
        // 사용자 목록(getEducations)은 부서 필터가 걸리므로, 시드 3건 로드 검증은 전체 조회로 확인한다
        Page<EducationListResponseDto> page =
                educationService.getAllEducations(PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(3);
        assertThat(page.getContent())
                .extracting(EducationListResponseDto::title)
                .contains("신입사원 온보딩 교육", "백엔드 기초 교육", "보안 심화 교육");
    }

    @Test
    @DisplayName("시드 3개 과정 상세를 user 1로 각각 조회해도 예외가 없다")
    void getEducationDetail_allSeededCourses() {
        // 신입사원 온보딩(1)만 실패한다는 증상 재현 확인
        assertThat(educationService.getEducationDetail(1L, 1L).title())
                .isEqualTo("신입사원 온보딩 교육");
        assertThat(educationService.getEducationDetail(1L, 2L).title())
                .isEqualTo("백엔드 기초 교육");
        assertThat(educationService.getEducationDetail(1L, 3L).title())
                .isEqualTo("보안 심화 교육");
    }

    @Test
    @DisplayName("education_progress는 같은 (user, education) 중복 저장을 유니크 제약으로 막는다")
    void educationProgress_rejectsDuplicate() {
        // 시드에 (user 1, education 1) 진도가 이미 존재 → 같은 조합을 하나 더 저장하면 예외
        Education education = educationRepository.findById(1L).orElseThrow();
        User user = userRepository.getReferenceById(1L);
        EducationProgress duplicate = EducationProgress.create(user, education);

        assertThatThrownBy(() -> educationProgressRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("같은 과정을 두 번 수강 처리해도 진도 레코드는 하나만 유지되고 상세 조회가 정상이다")
    void enroll_twice_isIdempotent() {
        // user 1은 education 3(보안 심화)에 진도 기록이 없음
        progressService.enroll(1L, 3L);
        progressService.enroll(1L, 3L);

        // 중복이 생기지 않아 단일 결과 조회가 예외 없이 동작한다
        assertThat(educationProgressRepository.findByUserIdAndEducationId(1L, 3L)).isPresent();
        assertThat(educationService.getEducationDetail(1L, 3L).enrolled()).isTrue();
    }
}
