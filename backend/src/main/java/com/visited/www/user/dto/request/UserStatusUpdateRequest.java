package com.visited.www.user.dto.request;

import com.visited.www.entity.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateRequest(

        @NotNull(message = "사용자 상태를 선택해주세요.")
        UserStatus status

) {
}