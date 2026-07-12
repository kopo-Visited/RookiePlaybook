package com.visited.www.schedule.controller;

import com.visited.www.global.response.ApiResponse;
import com.visited.www.schedule.dto.request.ScheduleRequest;
import com.visited.www.schedule.dto.response.ScheduleResponse;
import com.visited.www.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/schedules")
    public ApiResponse<List<ScheduleResponse>> getSchedules(
            @RequestParam(required = false) LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now(ZoneId.of("Asia/Seoul"));
        return ApiResponse.success(scheduleService.getSchedulesByDate(target));
    }

    @GetMapping("/admin/schedules")
    public ApiResponse<List<ScheduleResponse>> getAllSchedules() {
        return ApiResponse.success(scheduleService.getAllSchedules());
    }

    @PostMapping("/admin/schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ScheduleResponse> createSchedule(@RequestBody ScheduleRequest request) {
        return ApiResponse.success(scheduleService.createSchedule(request));
    }

    @PutMapping("/admin/schedules/{id}")
    public ApiResponse<ScheduleResponse> updateSchedule(@PathVariable Long id,
                                                        @RequestBody ScheduleRequest request) {
        return ApiResponse.success(scheduleService.updateSchedule(id, request));
    }

    @DeleteMapping("/admin/schedules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
    }
}