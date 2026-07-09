package com.visited.www.edu.dto.mapper;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AdminProgressDto {
    private Long userId;
    private String userName;
    private String departmentName;
    private String educationTitle;
    private Integer progressRate;
    private Boolean isCompleted;
    private LocalDateTime lastStudiedAt;
}
