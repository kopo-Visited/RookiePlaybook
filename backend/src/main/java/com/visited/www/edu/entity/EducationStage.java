package com.visited.www.edu.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
@Entity
@Table(name = "education_stages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EducationStage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "education_id", nullable = false)
    private Education education;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Integer orderNumber;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "stage", fetch = FetchType.LAZY)
    private EducationMaterial material;

    private EducationStage(Education education, String title, String description, Integer orderNumber) {
        this.education = education;
        this.title = title;
        this.description = description;
        this.orderNumber = orderNumber;
    }

    public static EducationStage create(Education education, String title, String description, Integer orderNumber) {
        return new EducationStage(education, title, description, orderNumber);
    }

    public void update(String title, String description, Integer orderNumber) {
        this.title = title;
        this.description = description;
        this.orderNumber = orderNumber;
    }
}
