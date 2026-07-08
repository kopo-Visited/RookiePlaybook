package com.visited.www.user.service;

import com.visited.www.entity.Department;
import com.visited.www.entity.Role;
import com.visited.www.entity.User;
import com.visited.www.entity.UserStatus;
import com.visited.www.user.dto.request.UserCreateRequest;
import com.visited.www.user.dto.request.UserRoleUpdateRequest;
import com.visited.www.user.dto.request.UserStatusUpdateRequest;
import com.visited.www.user.dto.request.UserUpdateRequest;
import com.visited.www.user.dto.response.DepartmentResponse;
import com.visited.www.user.dto.response.UserResponse;
import com.visited.www.user.repository.DepartmentRepository;
import com.visited.www.user.repository.RoleRepository;
import com.visited.www.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부서입니다."));

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 권한입니다."));

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .department(department)
                .role(role)
                .position(request.position())
                .status(request.status() == null ? UserStatus.ACTIVE : request.status())
                .build();

        User savedUser = userRepository.save(user);

        return UserResponse.from(savedUser);
    }

    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = getUserEntity(userId);

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부서입니다."));

        user.updateInfo(
                request.name(),
                department,
                request.position(),
                request.status()
        );

        return UserResponse.from(user);
    }

    public UserResponse updateUserRole(Long userId, UserRoleUpdateRequest request) {
        User user = getUserEntity(userId);

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 권한입니다."));

        user.updateRole(role);

        return UserResponse.from(user);
    }

    public UserResponse updateUserStatus(Long userId, UserStatusUpdateRequest request) {
        User user = getUserEntity(userId);

        user.updateInfo(
                user.getName(),
                user.getDepartment(),
                user.getPosition(),
                request.status()
        );

        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getDepartments() {
        return departmentRepository.findByActiveTrueOrderByIdAsc()
                .stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}