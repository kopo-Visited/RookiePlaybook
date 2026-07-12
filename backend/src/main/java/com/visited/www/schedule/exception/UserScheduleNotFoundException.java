package com.visited.www.schedule.exception;

public class UserScheduleNotFoundException extends RuntimeException {
    public UserScheduleNotFoundException(Long id) {
        super("일정을 찾을 수 없습니다: " + id);
    }
}
