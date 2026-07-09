package com.visited.www.edu.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EducationUpdateRequestDto {

    @NotBlank(message = "과정명은 필수입니다.")
    @Size(max = 100, message = "과정명은 100자 이내로 입력해 주세요.")
    private String title;

    private String description;

    @NotNull(message = "수료 기준은 필수입니다.")
    @Min(value = 0, message = "수료 기준은 0 이상이어야 합니다.")
    @Max(value = 100, message = "수료 기준은 100 이하여야 합니다.")
    private Integer completionCriteria;
}
