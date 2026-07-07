package com.visited.www.user.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.user.dto.response.DepartmentResponse;
import com.visited.www.user.service.AdminUserService;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/users/me")
    public ApiResponse<String> getMyInfo() {
        /*
         * TODO
         * Spring Security 적용 후 로그인한 사용자 정보를 반환하도록 수정
         */
        return ApiResponse.success("로그인 사용자 정보 조회 API 준비 중");
    }
}