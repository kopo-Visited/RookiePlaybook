package com.visited.www.qna.controller;

import com.visited.www.qna.dto.response.NotificationListResponseDto;
import com.visited.www.qna.dto.response.NotificationReadResponseDto;
import com.visited.www.qna.service.NotificationService;
import com.visited.www.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "알림 API (사용자) — QNA-API-007~008")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "알림 목록 조회", description = "본인 알림 목록과 미확인 알림 개수를 조회한다")
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationListResponseDto>> getMyNotifications(
            @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getMyNotifications(userId, pageable)));
    }

    @Operation(summary = "알림 읽음 처리")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationReadResponseDto>> updateNotificationRead(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long notificationId) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.markAsRead(userId, notificationId)));
    }

    @Operation(summary = "알림 전체 삭제", description = "본인 알림 기록을 모두 삭제한다")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications(
            @AuthenticationPrincipal Long userId) {
        notificationService.deleteAll(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "알림이 모두 삭제되었습니다."));
    }
}
