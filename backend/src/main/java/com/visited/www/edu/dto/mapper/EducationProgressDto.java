package com.visited.www.edu.dto.mapper;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class EducationProgressDto {
    private Long educationId;
    private Integer progressRate;
    private String status;
    private LocalDateTime completedAt;
    private Integer completedStages;
}
