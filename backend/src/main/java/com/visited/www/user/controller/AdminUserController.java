package com.visited.www.user.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.user.dto.request.UserCreateRequest;
import com.visited.www.user.dto.request.UserRoleUpdateRequest;
import com.visited.www.user.dto.request.UserStatusUpdateRequest;
import com.visited.www.user.dto.request.UserUpdateRequest;
import com.visited.www.user.dto.response.UserResponse;
import com.visited.www.user.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<List<UserResponse>> getUsers() {
        List<UserResponse> response = adminUserService.getUsers();
        return ApiResponse.success(response);
    }

    @PostMapping
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = adminUserService.createUser(request);
        return ApiResponse.success(response);
    }

    @PutMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        UserResponse response = adminUserService.updateUser(userId, request);
        return ApiResponse.success(response);
    }

    @PatchMapping("/{userId}/roles")
    public ApiResponse<UserResponse> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequest request
    ) {
        UserResponse response = adminUserService.updateUserRole(userId, request);
        return ApiResponse.success(response);
    }

    @PatchMapping("/{userId}/status")
    public ApiResponse<UserResponse> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        UserResponse response = adminUserService.updateUserStatus(userId, request);
        return ApiResponse.success(response);
    }
}