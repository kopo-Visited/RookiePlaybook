package com.visited.www.account.entity;

import com.visited.www.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "account_unlock_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccountUnlockRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 잠긴 대상 계정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name = "employee_no", nullable = false, length = 50)
    private String employeeNo;

    @Column(name = "department_name", nullable = false, length = 50)
    private String departmentName;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 500)
    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountUnlockRequestStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Builder
    private AccountUnlockRequest(
            User user,
            String name,
            String email,
            String employeeNo,
            String departmentName,
            String phone,
            String memo
    ) {
        this.user = user;
        this.name = name;
        this.email = email;
        this.employeeNo = employeeNo;
        this.departmentName = departmentName;
        this.phone = phone;
        this.memo = memo;
        this.status = AccountUnlockRequestStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isResolved() {
        return this.status == AccountUnlockRequestStatus.RESOLVED;
    }

    public void resolve(User admin) {
        this.status = AccountUnlockRequestStatus.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = admin;
    }
}
