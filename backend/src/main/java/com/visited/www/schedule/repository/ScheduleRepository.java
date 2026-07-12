package com.visited.www.schedule.repository;

import com.visited.www.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    @Query("SELECT s FROM Schedule s WHERE s.scheduleDate = :date AND (s.departmentId IS NULL OR s.departmentId = :departmentId) ORDER BY s.startTime ASC")
    List<Schedule> findByDateForUser(@Param("date") LocalDate date, @Param("departmentId") Long departmentId);

    List<Schedule> findAllByOrderByScheduleDateAscStartTimeAsc();
}