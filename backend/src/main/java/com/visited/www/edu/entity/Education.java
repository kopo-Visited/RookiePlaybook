package com.visited.www.edu.entity;

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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "education", fetch = FetchType.LAZY)
    @OrderBy("orderNumber ASC")
    private List<EducationStage> stages = new ArrayList<>();

    private Education(String title, String description, Integer completionCriteria) {
        this.title = title;
        this.description = description;
        this.completionCriteria = completionCriteria;
    }

    public static Education create(String title, String description, Integer completionCriteria) {
        return new Education(title, description, completionCriteria);
    }

    public void update(String title, String description, Integer completionCriteria) {
        this.title = title;
        this.description = description;
        this.completionCriteria = completionCriteria;
    }
}
