package com.visited.www.schedule.service;

import com.visited.www.schedule.dto.request.ScheduleRequest;
import com.visited.www.schedule.dto.response.UserScheduleResponse;

import java.time.LocalDate;
import java.util.List;

public interface UserScheduleService {

    List<UserScheduleResponse> getSchedulesByDate(Long userId, LocalDate date);

    UserScheduleResponse createSchedule(Long userId, ScheduleRequest request);

    UserScheduleResponse updateSchedule(Long userId, Long id, ScheduleRequest request);

    void deleteSchedule(Long userId, Long id);
}
