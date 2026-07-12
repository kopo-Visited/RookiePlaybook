package com.visited.www.schedule.service;

import com.visited.www.schedule.dto.request.ScheduleRequest;
import com.visited.www.schedule.dto.response.ScheduleResponse;
import com.visited.www.schedule.entity.Schedule;
import com.visited.www.schedule.exception.ScheduleNotFoundException;
import com.visited.www.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Override
    public List<ScheduleResponse> getSchedulesByDate(LocalDate date) {
        return scheduleRepository.findByScheduleDateOrderByStartTimeAsc(date)
                .stream()
                .map(ScheduleResponse::from)
                .toList();
    }

    @Override
    public List<ScheduleResponse> getAllSchedules() {
        return scheduleRepository.findAllByOrderByScheduleDateAscStartTimeAsc()
                .stream()
                .map(ScheduleResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        Schedule schedule = Schedule.builder()
                .title(request.getTitle())
                .place(request.getPlace())
                .scheduleDate(request.getScheduleDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .dotColor(request.getDotColor() != null ? request.getDotColor() : "#2288FF")
                .build();

        return ScheduleResponse.from(scheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    public ScheduleResponse updateSchedule(Long id, ScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ScheduleNotFoundException(id));

        schedule.update(request.getTitle(), request.getPlace(), request.getScheduleDate(),
                request.getStartTime(), request.getEndTime(),
                request.getDotColor() != null ? request.getDotColor() : schedule.getDotColor());

        return ScheduleResponse.from(schedule);
    }

    @Override
    @Transactional
    public void deleteSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ScheduleNotFoundException(id));
        scheduleRepository.delete(schedule);
    }
}