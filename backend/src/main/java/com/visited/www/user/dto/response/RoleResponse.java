package com.visited.www.user.dto.response;

import com.visited.www.entity.Role;

public record RoleResponse(
        Long roleId,
        String code,
        String name
) {

    public static RoleResponse from(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getCode(),
                role.getName()
        );
    }
}
