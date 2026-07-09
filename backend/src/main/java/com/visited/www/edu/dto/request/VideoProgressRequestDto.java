package com.visited.www.edu.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class VideoProgressRequestDto {

    @NotNull(message = "자료 ID는 필수입니다.")
    private Long materialId;

    @NotNull(message = "시청 위치는 필수입니다.")
    @Min(value = 0, message = "시청 위치는 0 이상이어야 합니다.")
    private Integer watchedPosition;
}
