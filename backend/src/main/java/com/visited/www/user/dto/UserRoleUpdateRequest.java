package com.visited.www.user.dto.request;

import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequest(

        @NotNull(message = "권한을 선택해주세요.")
        Long roleId

) {
}