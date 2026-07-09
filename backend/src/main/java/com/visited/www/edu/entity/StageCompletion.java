package com.visited.www.edu.entity;

import com.visited.www.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stage_completions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StageCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private EducationStage stage;

    private LocalDateTime completedAt;

    private StageCompletion(User user, EducationStage stage) {
        this.user = user;
        this.stage = stage;
        this.completedAt = LocalDateTime.now();
    }

    public static StageCompletion of(User user, EducationStage stage) {
        return new StageCompletion(user, stage);
    }
}
