package com.visited.www.user.repository;

import com.visited.www.entity.User;
import com.visited.www.entity.UserStatus;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByStatus(UserStatus status);

    @Query("SELECT u.employeeNo FROM User u WHERE u.department.id = :departmentId AND u.employeeNo IS NOT NULL")
    List<String> findEmployeeNosByDepartmentId(@Param("departmentId") Long departmentId);

    long countByCreatedAtBefore(LocalDateTime dateTime);

    long countByDepartment_IdAndStatusNot(Long departmentId, UserStatus status);

    @Query("SELECT u.lastLoginAt FROM User u WHERE u.lastLoginAt IS NOT NULL")
    List<LocalDateTime> findAllLastLoginTimestamps();

    List<User> findTop5ByOrderByCreatedAtDesc();
}