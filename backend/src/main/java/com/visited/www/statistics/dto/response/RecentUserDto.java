package com.visited.www.statistics.dto.response;

import com.visited.www.entity.User;
import java.time.LocalDateTime;

/** 대시보드 "사용자 관리" 위젯에 노출할 최근 가입 사용자 */
public record RecentUserDto(
        Long userId,
        String name,
        String departmentName,
        String position,
        String email,
        String status,
        LocalDateTime createdAt
) {
    public static RecentUserDto from(User user) {
        return new RecentUserDto(
                user.getId(),
                user.getName(),
                user.getDepartment().getName(),
                user.getPosition(),
                user.getEmail(),
                user.getStatus().name(),
                user.getCreatedAt()
        );
    }
}
