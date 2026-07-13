package com.visited.www.edu.service;

import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.repository.EducationRepository;
import com.visited.www.entity.Department;
import com.visited.www.user.repository.DepartmentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 이슈 #328 회귀 테스트 — 온보딩 교육 목록을 사용자 부서 + 공통 과정으로만 노출.
 *
 * 시드: 사용자 2(홍길동)=개발팀. 교육 1=공통, 2=개발팀, 3=보안팀.
 * 개발팀 사용자는 공통(1) + 개발팀(2)만 보여야 하고 보안팀(3)은 제외돼야 한다.
 * 관리자 전체 조회(getAllEducations)는 부서와 무관하게 전부 반환한다.
 */
@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("교육 목록 부서별 필터링 (이슈 #328)")
class EducationDepartmentFilterTest {

    @Autowired
    private EducationService educationService;
    @Autowired
    private EducationRepository educationRepository;
    @Autowired
    private DepartmentRepository departmentRepository;

    private static final Long DEV_USER_ID = 2L;

    private List<Long> educationIdsFor(Page<EducationListResponseDto> page) {
        return page.getContent().stream().map(EducationListResponseDto::educationId).toList();
    }

    @Test
    @DisplayName("개발팀 사용자는 공통 과정과 개발팀 과정만 보이고 타 부서(보안) 과정은 제외된다")
    void getEducations_devUser_seesCommonAndOwnDepartmentOnly() {
        // when
        List<Long> ids = educationIdsFor(
                educationService.getEducations(DEV_USER_ID, PageRequest.of(0, 100)));

        // then
        assertThat(ids).contains(1L, 2L);    // 공통 + 개발팀
        assertThat(ids).doesNotContain(3L);  // 보안팀(타 부서)
    }

    @Test
    @DisplayName("관리자 전체 조회는 부서와 무관하게 모든 과정을 반환한다")
    void getAllEducations_returnsAllRegardlessOfDepartment() {
        // when
        List<Long> ids = educationIdsFor(
                educationService.getAllEducations(PageRequest.of(0, 100)));

        // then
        assertThat(ids).contains(1L, 2L, 3L);
    }

    @Test
    @DisplayName("타 부서 전용으로 등록한 과정은 개발팀 사용자에게 노출되지 않고 관리자 전체엔 포함된다")
    void getEducations_excludesOtherDepartmentCourse() {
        // given — 보안팀 전용 과정 신규 등록
        Department security = departmentRepository.findByCode("SECURITY").orElseThrow();
        Education saved = educationRepository.save(
                Education.create("보안 전용 신규 과정", "설명", 50, 2024, security));

        // when & then
        assertThat(educationIdsFor(educationService.getEducations(DEV_USER_ID, PageRequest.of(0, 100))))
                .doesNotContain(saved.getId());
        assertThat(educationIdsFor(educationService.getAllEducations(PageRequest.of(0, 100))))
                .contains(saved.getId());
    }

    @Test
    @DisplayName("공통(부서 미지정)으로 등록한 과정은 개발팀 사용자에게도 노출된다")
    void getEducations_includesCommonCourse() {
        // given — 공통 과정 신규 등록 (department = null)
        Education saved = educationRepository.save(
                Education.create("공통 신규 과정", "설명", 50, 2024, null));

        // when & then
        assertThat(educationIdsFor(educationService.getEducations(DEV_USER_ID, PageRequest.of(0, 100))))
                .contains(saved.getId());
    }
}
