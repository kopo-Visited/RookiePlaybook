package com.visited.www.edu.dto.mapper;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class IncompleteProgressDto {
    private Long userId;
    private String userName;
    private String departmentName;
    private String educationTitle;
    private Integer progressRate;
    private Integer completionCriteria;
}
