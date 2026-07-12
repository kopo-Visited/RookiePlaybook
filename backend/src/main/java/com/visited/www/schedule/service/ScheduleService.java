package com.visited.www.schedule.service;

import com.visited.www.schedule.dto.request.ScheduleRequest;
import com.visited.www.schedule.dto.response.ScheduleResponse;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleService {

    List<ScheduleResponse> getSchedulesByDate(LocalDate date, Long userId);

    List<ScheduleResponse> getAllSchedules();

    ScheduleResponse createSchedule(ScheduleRequest request);

    ScheduleResponse updateSchedule(Long id, ScheduleRequest request);

    void deleteSchedule(Long id);
}