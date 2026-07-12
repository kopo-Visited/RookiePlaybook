package com.visited.www.schedule.dto.request;

import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
public class ScheduleRequest {

    private String title;
    private String place;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String dotColor;
}
