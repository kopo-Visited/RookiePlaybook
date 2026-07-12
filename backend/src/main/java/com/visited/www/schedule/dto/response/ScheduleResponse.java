package com.visited.www.schedule.dto.response;

import com.visited.www.schedule.entity.Schedule;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class ScheduleResponse {

    private Long id;
    private String title;
    private String place;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String dotColor;

    public static ScheduleResponse from(Schedule schedule) {
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .title(schedule.getTitle())
                .place(schedule.getPlace())
                .scheduleDate(schedule.getScheduleDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .dotColor(schedule.getDotColor())
                .build();
    }
}