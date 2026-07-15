package com.visited.www.schedule.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 100)
    private String place;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "dot_color", length = 20)
    private String dotColor;

    @Column(name = "department_id")
    private Long departmentId;

    public void update(String title, String place, LocalDate scheduleDate,
                       LocalTime startTime, LocalTime endTime, String dotColor, Long departmentId) {
        this.title = title;
        this.place = place;
        this.scheduleDate = scheduleDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.dotColor = dotColor;
        this.departmentId = departmentId;
    }
}
