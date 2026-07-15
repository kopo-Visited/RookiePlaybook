package com.visited.www.edu.dto.mapper;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StageWithProgressDto {
    private Long stageId;
    private String title;
    private String description;
    private Integer orderNumber;
    private Boolean isCompleted;
    private Long materialId;
    private String materialTitle;
    private String videoUrl;
    private Integer lastWatchedPosition;
}