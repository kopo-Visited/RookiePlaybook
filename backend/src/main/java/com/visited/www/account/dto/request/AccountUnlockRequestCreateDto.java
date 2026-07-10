package com.visited.www.account.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountUnlockRequestCreateDto(

        @NotBlank(message = "이름을 입력해주세요.")
        @Size(max = 50, message = "이름은 50자 이내로 입력해주세요.")
        String name,

        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "사번을 입력해주세요.")
        @Size(max = 50, message = "사번은 50자 이내로 입력해주세요.")
        String employeeNo,

        @NotBlank(message = "부서를 입력해주세요.")
        @Size(max = 50, message = "부서는 50자 이내로 입력해주세요.")
        String departmentName,

        @NotBlank(message = "전화번호를 입력해주세요.")
        @Size(max = 30, message = "전화번호는 30자 이내로 입력해주세요.")
        String phone,

        @Size(max = 500, message = "메모는 500자 이내로 입력해주세요.")
        String memo

) {
}
