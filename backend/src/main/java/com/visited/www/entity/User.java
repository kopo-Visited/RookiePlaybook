package com.visited.www.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 사용자 이름
    @Column(nullable = false, length = 50)
    private String name;

    // 로그인 ID로 사용하는 이메일
    @Column(nullable = false, length = 100)
    private String email;

    // 암호화된 비밀번호
    @Column(nullable = false)
    private String password;

    // 소속 부서
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // 사용자 권한
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    // 직급/직책은 선택값
    @Column(length = 50)
    private String position;

    // 사번
    @Column(name = "employee_no", length = 50)
    private String employeeNo;

    @Column(length = 30)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    // 초기/관리자 재설정 비밀번호 상태라 사용자가 반드시 비밀번호를 바꿔야 하는지 여부
    @Column(name = "password_change_required", nullable = false, columnDefinition = "boolean default false")
    private boolean passwordChangeRequired;

    // 연속 로그인 실패 횟수. 5회 도달 시 계정이 LOCKED 상태가 된다
    @Column(name = "failed_login_count", nullable = false, columnDefinition = "integer default 0")
    private int failedLoginCount;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.status = this.status == null ? UserStatus.ACTIVE : this.status;
        this.passwordChangeRequired = true;
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void updateInfo(String name, Department department, String position, UserStatus status) {
        this.name = name;
        this.department = department;
        this.position = position;
        this.status = status;
    }

    public void updatePhone(String phone) {
        this.phone = phone;
    }

    public void updateRole(Role role) {
        this.role = role;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void completePasswordChange(String encodedPassword) {
        this.password = encodedPassword;
        this.passwordChangeRequired = false;
    }

    public void updateLastLoginAt() {
        this.lastLoginAt = LocalDateTime.now();
        this.failedLoginCount = 0;
    }

    public void increaseFailedLoginCount() {
        this.failedLoginCount++;
    }

    public void resetFailedLoginCount() {
        this.failedLoginCount = 0;
    }

    public void lock() {
        this.status = UserStatus.LOCKED;
    }

    // 잠금 해제 시 초기 비밀번호로 되돌리고 재설정을 강제한다
    public void unlockWithPasswordReset(String encodedInitialPassword) {
        this.status = UserStatus.ACTIVE;
        this.failedLoginCount = 0;
        this.password = encodedInitialPassword;
        this.passwordChangeRequired = true;
    }
}