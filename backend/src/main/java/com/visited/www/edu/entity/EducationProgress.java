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

    private EducationProgress(User user, Education education) {
        this.user = user;
        this.education = education;
        this.progressRate = 0;
        this.status = ProgressStatus.NOT_STARTED;
    }

    public static EducationProgress create(User user, Education education) {
        return new EducationProgress(user, education);
    }

    // 수강 시작(enroll) 시 진행중으로 표시 (아직 시작 전 상태일 때만)
    public void markInProgress() {
        if (this.status == ProgressStatus.NOT_STARTED) {
            this.status = ProgressStatus.IN_PROGRESS;
        }
    }

    // 진도율을 갱신하고 수료 기준 이상이면 수료 처리한다 (완료 시각은 최초 1회만 기록)
    public void updateProgress(int progressRate, int completionCriteria) {
        this.progressRate = progressRate;

        if (progressRate >= completionCriteria) {
            if (this.status != ProgressStatus.COMPLETED) {
                this.status = ProgressStatus.COMPLETED;
                this.completedAt = LocalDateTime.now();
            }
        } else if (progressRate > 0) {
            // 단계 추가 등으로 수료 기준 아래로 내려오면 수료를 해제한다 (완료 시각도 초기화)
            this.status = ProgressStatus.IN_PROGRESS;
            this.completedAt = null;
        } else {
            this.status = ProgressStatus.NOT_STARTED;
            this.completedAt = null;
        }
    }

    public boolean isCompleted() {
        return this.status == ProgressStatus.COMPLETED;
    }
}