package com.visited.www.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentUpdateRequest(

        @NotBlank(message = "부서명을 입력해주세요.")
        @Size(max = 50, message = "부서명은 50자 이내로 입력해주세요.")
        String name

) {
}
