package com.visited.www.schedule.service;

import com.visited.www.schedule.dto.request.ScheduleRequest;
import com.visited.www.schedule.dto.response.UserScheduleResponse;
import com.visited.www.schedule.entity.UserSchedule;
import com.visited.www.schedule.exception.UserScheduleNotFoundException;
import com.visited.www.schedule.repository.UserScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserScheduleServiceImpl implements UserScheduleService {

    private final UserScheduleRepository userScheduleRepository;

    @Override
    public List<UserScheduleResponse> getSchedulesByDate(Long userId, LocalDate date) {
        return userScheduleRepository
                .findByUserIdAndScheduleDateOrderByStartTimeAsc(userId, date)
                .stream()
                .map(UserScheduleResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public UserScheduleResponse createSchedule(Long userId, ScheduleRequest request) {
        UserSchedule schedule = UserSchedule.builder()
                .userId(userId)
                .title(request.getTitle())
                .place(request.getPlace())
                .scheduleDate(request.getScheduleDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .dotColor(request.getDotColor() != null ? request.getDotColor() : "#2288FF")
                .build();
        return UserScheduleResponse.from(userScheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    public UserScheduleResponse updateSchedule(Long userId, Long id, ScheduleRequest request) {
        UserSchedule schedule = userScheduleRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new UserScheduleNotFoundException(id));
        schedule.update(request.getTitle(), request.getPlace(), request.getScheduleDate(),
                request.getStartTime(), request.getEndTime(),
                request.getDotColor() != null ? request.getDotColor() : schedule.getDotColor());
        return UserScheduleResponse.from(schedule);
    }

    @Override
    @Transactional
    public void deleteSchedule(Long userId, Long id) {
        UserSchedule schedule = userScheduleRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new UserScheduleNotFoundException(id));
        userScheduleRepository.delete(schedule);
    }
}