package com.visited.www.user.service;

import com.visited.www.entity.Department;
import com.visited.www.entity.Role;
import com.visited.www.entity.User;
import com.visited.www.entity.UserStatus;
import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import com.visited.www.user.dto.request.DepartmentCreateRequest;
import com.visited.www.user.dto.request.DepartmentUpdateRequest;
import com.visited.www.user.dto.request.PasswordChangeRequest;
import com.visited.www.user.dto.request.UserCreateRequest;
import com.visited.www.user.dto.request.UserRoleUpdateRequest;
import com.visited.www.user.dto.request.UserStatusUpdateRequest;
import com.visited.www.user.dto.request.UserUpdateRequest;
import com.visited.www.user.dto.response.DepartmentResponse;
import com.visited.www.user.dto.response.RoleResponse;
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

    // 관리자가 등록하는 모든 신규 계정의 고정 초기 비밀번호. 최초 로그인 후 반드시 변경해야 한다.
    private static final String INITIAL_PASSWORD = "0000";

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

    @Transactional(readOnly = true)
    public UserResponse getMyInfo(Long userId) {
        return UserResponse.from(getUserEntity(userId));
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
                .password(passwordEncoder.encode(INITIAL_PASSWORD))
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

    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = getUserEntity(userId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }

        user.completePasswordChange(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getDepartments() {
        return departmentRepository.findByActiveTrueOrderByIdAsc()
                .stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> getRoles() {
        return roleRepository.findByActiveTrueOrderByIdAsc()
                .stream()
                .map(RoleResponse::from)
                .toList();
    }

    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        if (departmentRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException("이미 사용 중인 부서 코드입니다.");
        }

        Department department = Department.builder()
                .code(request.code())
                .name(request.name())
                .build();

        return DepartmentResponse.from(departmentRepository.save(department));
    }

    public DepartmentResponse renameDepartment(Long departmentId, DepartmentUpdateRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부서입니다."));

        department.rename(request.name());

        return DepartmentResponse.from(department);
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}