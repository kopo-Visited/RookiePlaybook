package com.visited.www.schedule.repository;

import com.visited.www.schedule.entity.UserSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserScheduleRepository extends JpaRepository<UserSchedule, Long> {

    List<UserSchedule> findByUserIdAndScheduleDateOrderByStartTimeAsc(Long userId, LocalDate date);

    Optional<UserSchedule> findByIdAndUserId(Long id, Long userId);
}