package com.visited.www.user.dto.request;

import com.visited.www.entity.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UserUpdateRequest(

        @NotBlank(message = "이름을 입력해주세요.")
        String name,

        @NotNull(message = "부서를 선택해주세요.")
        Long departmentId,

        String position,

        @NotBlank(message = "전화번호를 입력해주세요.")
        @Pattern(regexp = "^(\\d{11}|\\d{3}-\\d{4}-\\d{4})$", message = "전화번호는 숫자 11자리로 입력해주세요. (하이픈 포함/미포함 모두 가능)")
        String phone,

        @NotNull(message = "사용자 상태를 선택해주세요.")
        UserStatus status
) {
}