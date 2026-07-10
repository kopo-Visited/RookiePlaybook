package com.visited.www.user.dto.request;

import com.visited.www.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserCreateRequest(

        @NotBlank(message = "이름을 입력해주세요.")
        String name,

        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "이메일 형식이 올바르지 않습니다.")
        String email,

        @NotBlank(message = "비밀번호를 입력해주세요.")
        String password,

        @NotNull(message = "부서를 선택해주세요.")
        Long departmentId,

        @NotNull(message = "권한을 선택해주세요.")
        Long roleId,

        String position,

        @NotBlank(message = "사번을 입력해주세요.")
        String employeeNo,

        @NotBlank(message = "전화번호를 입력해주세요.")
        String phone,

        UserStatus status
) {
}