package com.visited.www.schedule.dto.response;

import com.visited.www.schedule.entity.UserSchedule;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class UserScheduleResponse {

    private Long id;
    private String title;
    private String place;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String dotColor;

    public static UserScheduleResponse from(UserSchedule s) {
        return UserScheduleResponse.builder()
                .id(s.getId())
                .title(s.getTitle())
                .place(s.getPlace())
                .scheduleDate(s.getScheduleDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .dotColor(s.getDotColor())
                .build();
    }
}