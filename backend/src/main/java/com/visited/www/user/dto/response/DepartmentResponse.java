package com.visited.www.user.dto.response;

import com.visited.www.entity.Department;

public record DepartmentResponse(
        Long departmentId,
        String code,
        String name
) {

    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getCode(),
                department.getName()
        );
    }
}