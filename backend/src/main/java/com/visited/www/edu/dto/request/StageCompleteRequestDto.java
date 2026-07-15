package com.visited.www.edu.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StageCompleteRequestDto {

    @NotNull(message = "단계 ID는 필수입니다.")
    private Long stageId;
}
