package com.visited.www.edu.entity;

import com.visited.www.entity.Department;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "educations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Integer completionCriteria;

    // 콘텐츠 기준 연도 (예: 2024) — 실제 등록일(createdAt)과 별개인 콘텐츠 연식
    private Integer contentYear;

    // 대상 부서. null이면 공통(전체 부서에 노출)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "education", fetch = FetchType.LAZY)
    @OrderBy("orderNumber ASC")
    private List<EducationStage> stages = new ArrayList<>();

    private Education(String title, String description, Integer completionCriteria,
                     Integer contentYear, Department department) {
        this.title = title;
        this.description = description;
        this.completionCriteria = completionCriteria;
        this.contentYear = contentYear;
        this.department = department;
    }

    // department가 null이면 공통 과정(전체 부서 노출)
    public static Education create(
            String title, String description, Integer completionCriteria,
            Integer contentYear, Department department) {
        return new Education(title, description, completionCriteria, contentYear, department);
    }

    public void update(
            String title, String description, Integer completionCriteria,
            Integer contentYear, Department department) {
        this.title = title;
        this.description = description;
        this.completionCriteria = completionCriteria;
        this.contentYear = contentYear;
        this.department = department;
    }
}
