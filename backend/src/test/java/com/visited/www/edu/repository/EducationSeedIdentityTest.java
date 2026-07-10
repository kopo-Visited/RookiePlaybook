package com.visited.www.edu.repository;

import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationStage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * EDU-FR-007/008 회귀 테스트.
 *
 * data-h2.sql이 educations/education_stages를 명시적 id로 시드하면서 IDENTITY 카운터를
 * 올리지 않아, 관리자 등록 시 id=1부터 생성돼 시드와 PK 충돌(23505)로 500이 발생했다.
 * 시드 뒤 ALTER TABLE ... RESTART 문으로 카운터를 시드 다음 값으로 맞춰 해결한다.
 *
 * local 프로파일(H2 인메모리 + data-h2.sql 시드)로 실제 repository 저장을 수행해,
 * 시드 최대 id 이후 값이 생성되며 PK 충돌 없이 저장되는지 검증한다.
 */
@SpringBootTest
@ActiveProfiles("local")
@DisplayName("교육 시드 IDENTITY 카운터 회귀 테스트 (EDU-FR-007/008)")
class EducationSeedIdentityTest {

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private EducationStageRepository educationStageRepository;

    @Test
    @DisplayName("시드(id 1~3) 로드 후 교육 과정을 등록하면 PK 충돌 없이 시드 다음 id로 저장된다")
    void createEducation_afterSeed_noPkCollision() {
        // given & when — 시드 카운터가 안 맞으면 이 save에서 PK 충돌 예외가 발생한다
        Education saved = educationRepository.save(Education.create("회귀 테스트 과정", "설명", 70));

        // then — 시드 최대 id(3) 이후 값이 생성되어야 한다
        assertThat(saved.getId()).isGreaterThan(3L);
    }

    @Test
    @DisplayName("시드(id 1~6) 로드 후 교육 단계를 등록하면 PK 충돌 없이 시드 다음 id로 저장된다")
    void createStage_afterSeed_noPkCollision() {
        // given
        Education education = educationRepository.findById(1L).orElseThrow();

        // when — 시드 카운터가 안 맞으면 이 save에서 PK 충돌 예외가 발생한다
        EducationStage saved = educationStageRepository.save(
                EducationStage.create(education, "회귀 테스트 단계", "설명", 99));

        // then — 시드 최대 id(6) 이후 값이 생성되어야 한다
        assertThat(saved.getId()).isGreaterThan(6L);
    }
}
