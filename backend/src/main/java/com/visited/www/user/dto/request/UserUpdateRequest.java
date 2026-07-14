package com.visited.www.user.dto.request;

import com.visited.www.entity.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserUpdateRequest(

        @NotBlank(message = "이름을 입력해주세요.")
        String name,

        @NotNull(message = "부서를 선택해주세요.")
        Long departmentId,

        String position,

        @NotBlank(message = "전화번호를 입력해주세요.")
        String phone,

        @NotNull(message = "사용자 상태를 선택해주세요.")
        UserStatus status
) {
}