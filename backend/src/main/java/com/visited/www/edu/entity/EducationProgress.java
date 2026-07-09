package com.visited.www.edu.entity;

import com.visited.www.edu.enums.ProgressStatus;
import com.visited.www.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "education_progress")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EducationProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "education_id", nullable = false)
    private Education education;

    @Column(nullable = false)
    private Integer progressRate = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status = ProgressStatus.NOT_STARTED;

    private LocalDateTime completedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}