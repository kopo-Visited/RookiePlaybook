package com.visited.www.edu.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "education_materials")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EducationMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false, unique = true)
    private EducationStage stage;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String videoUrl;

    // 영상 전체 길이(초). 관리자 단계 등록 시 입력되며, 미입력 시 null
    private Integer totalDuration;
}
