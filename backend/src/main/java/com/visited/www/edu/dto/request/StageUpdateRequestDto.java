package com.visited.www.edu.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StageUpdateRequestDto {

    @NotBlank(message = "단계명은 필수입니다.")
    @Size(max = 100, message = "단계명은 100자 이내로 입력해 주세요.")
    private String title;

    private String description;

    @NotNull(message = "단계 순서는 필수입니다.")
    @Min(value = 1, message = "단계 순서는 1 이상이어야 합니다.")
    private Integer orderNumber;

    @NotBlank(message = "영상 제목은 필수입니다.")
    private String videoTitle;

    @NotBlank(message = "영상 URL은 필수입니다.")
    private String videoUrl;
}
