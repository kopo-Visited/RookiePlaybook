package com.visited.www.user.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.user.dto.response.DepartmentResponse;
import com.visited.www.user.dto.response.RoleResponse;
import com.visited.www.user.dto.response.UserResponse;
import com.visited.www.user.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final AdminUserService adminUserService;

    @GetMapping("/departments")
    public ApiResponse<List<DepartmentResponse>> getDepartments() {
        List<DepartmentResponse> response = adminUserService.getDepartments();
        return ApiResponse.success(response);
    }

    @GetMapping("/roles")
    public ApiResponse<List<RoleResponse>> getRoles() {
        List<RoleResponse> response = adminUserService.getRoles();
        return ApiResponse.success(response);
    }

    @GetMapping("/users/me")
    public ApiResponse<UserResponse> getMyInfo(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.success(adminUserService.getMyInfo(userId));
    }
}
