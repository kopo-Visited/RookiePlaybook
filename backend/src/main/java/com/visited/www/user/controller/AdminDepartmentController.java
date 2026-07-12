package com.visited.www.user.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.user.dto.request.DepartmentCreateRequest;
import com.visited.www.user.dto.request.DepartmentUpdateRequest;
import com.visited.www.user.dto.response.DepartmentResponse;
import com.visited.www.user.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/departments")
@RequiredArgsConstructor
public class AdminDepartmentController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<List<DepartmentResponse>> getDepartments() {
        return ApiResponse.success(adminUserService.getDepartments());
    }

    @PostMapping
    public ApiResponse<DepartmentResponse> createDepartment(
            @Valid @RequestBody DepartmentCreateRequest request
    ) {
        return ApiResponse.success(adminUserService.createDepartment(request), "부서가 추가되었습니다.");
    }

    @PutMapping("/{departmentId}")
    public ApiResponse<DepartmentResponse> renameDepartment(
            @PathVariable Long departmentId,
            @Valid @RequestBody DepartmentUpdateRequest request
    ) {
        return ApiResponse.success(adminUserService.renameDepartment(departmentId, request), "부서명이 변경되었습니다.");
    }
}
