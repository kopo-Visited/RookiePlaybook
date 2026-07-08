package com.visited.www.edu.entity;

import com.visited.www.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "video_progress")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VideoProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private EducationMaterial material;

    @Column(nullable = false)
    private Integer watchedPosition = 0;
}
