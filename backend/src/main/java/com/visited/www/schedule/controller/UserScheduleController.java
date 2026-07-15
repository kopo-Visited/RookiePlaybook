package com.visited.www.schedule.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.schedule.dto.request.ScheduleRequest;
import com.visited.www.schedule.dto.response.UserScheduleResponse;
import com.visited.www.schedule.service.UserScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/user/schedules")
@RequiredArgsConstructor
public class UserScheduleController {

    private final UserScheduleService userScheduleService;

    @GetMapping
    public ApiResponse<List<UserScheduleResponse>> getSchedules(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now(ZoneId.of("Asia/Seoul"));
        return ApiResponse.success(userScheduleService.getSchedulesByDate(userId, target));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserScheduleResponse> createSchedule(
            @AuthenticationPrincipal Long userId,
            @RequestBody ScheduleRequest request) {
        return ApiResponse.success(userScheduleService.createSchedule(userId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserScheduleResponse> updateSchedule(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody ScheduleRequest request) {
        return ApiResponse.success(userScheduleService.updateSchedule(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSchedule(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        userScheduleService.deleteSchedule(userId, id);
    }
}