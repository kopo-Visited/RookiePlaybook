package com.visited.www.schedule.repository;

import com.visited.www.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByScheduleDateOrderByStartTimeAsc(LocalDate date);

    List<Schedule> findAllByOrderByScheduleDateAscStartTimeAsc();
}