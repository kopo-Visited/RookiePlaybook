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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    // 초기/관리자 재설정 비밀번호 상태라 사용자가 반드시 비밀번호를 바꿔야 하는지 여부
    @Column(name = "password_change_required", nullable = false, columnDefinition = "boolean default false")
    private boolean passwordChangeRequired;

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
    }
}