package com.visited.www.user.service;

import com.visited.www.entity.Department;
import com.visited.www.entity.Role;
import com.visited.www.entity.User;
import com.visited.www.entity.UserStatus;
import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import com.visited.www.user.exception.DepartmentNotFoundException;
import com.visited.www.user.exception.DuplicateDepartmentCodeException;
import com.visited.www.user.exception.DuplicateEmailException;
import com.visited.www.user.exception.RoleNotFoundException;
import com.visited.www.user.exception.UserNotFoundException;
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

import java.time.Year;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    // 관리자가 등록하는 모든 신규 계정의 고정 초기 비밀번호. 최초 로그인 후 반드시 변경해야 한다.
    private static final String INITIAL_PASSWORD = "0000";

    // RP{가입연도 2자리}-{부서코드}-{부서별 4자리 순번}, 예: RP26-DEV-0001
    private static final String EMPLOYEE_NO_FORMAT = "RP%02d-%s-%04d";

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
            throw new DuplicateEmailException(request.email());
        }

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new DepartmentNotFoundException(request.departmentId()));

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new RoleNotFoundException(request.roleId()));

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(INITIAL_PASSWORD))
                .department(department)
                .role(role)
                .position(request.position())
                .employeeNo(generateEmployeeNo(department))
                .phone(request.phone())
                .status(request.status() == null ? UserStatus.ACTIVE : request.status())
                .build();

        User savedUser = userRepository.save(user);

        return UserResponse.from(savedUser);
    }

    // 부서코드 + 가입연도 + 부서별 순번으로 사번을 자동 생성한다. 사번은 관리자가 직접 입력하지 않는다.
    private String generateEmployeeNo(Department department) {
        String deptCode = department.getCode();
        Pattern pattern = Pattern.compile("^RP\\d{2}-" + Pattern.quote(deptCode) + "-(\\d{4})$");

        int nextSequence = userRepository.findEmployeeNosByDepartmentId(department.getId()).stream()
                .map(pattern::matcher)
                .filter(Matcher::matches)
                .map(matcher -> Integer.parseInt(matcher.group(1)))
                .max(Comparator.naturalOrder())
                .orElse(0) + 1;

        int currentYear = Year.now().getValue() % 100;
        return String.format(EMPLOYEE_NO_FORMAT, currentYear, deptCode, nextSequence);
    }

    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = getUserEntity(userId);

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new DepartmentNotFoundException(request.departmentId()));

        user.updateInfo(
                request.name(),
                department,
                request.position(),
                request.status()
        );
        user.updatePhone(request.phone());

        return UserResponse.from(user);
    }

    public UserResponse updateUserRole(Long userId, UserRoleUpdateRequest request) {
        User user = getUserEntity(userId);

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new RoleNotFoundException(request.roleId()));

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

        // LOCKED 상태였던 계정을 ACTIVE로 되돌릴 때 실패 카운트를 초기화하지 않으면
        // 곧바로 다음 로그인 실패 1회만으로 재잠김된다.
        if (request.status() == UserStatus.ACTIVE) {
            user.resetFailedLoginCount();
        }

        return UserResponse.from(user);
    }

    public UserResponse deleteUser(Long userId, Long currentUserId) {
        if (userId.equals(currentUserId)) {
            throw new BusinessException("본인 계정은 삭제할 수 없습니다.", ErrorCode.CONFLICT);
        }

        User user = getUserEntity(userId);

        if (user.getStatus() == UserStatus.DELETED) {
            throw new BusinessException("이미 삭제된 사용자입니다.", ErrorCode.CONFLICT);
        }

        user.updateInfo(
                user.getName(),
                user.getDepartment(),
                user.getPosition(),
                UserStatus.DELETED
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
            throw new DuplicateDepartmentCodeException(request.code());
        }

        Department department = Department.builder()
                .code(request.code())
                .name(request.name())
                .build();

        return DepartmentResponse.from(departmentRepository.save(department));
    }

    public DepartmentResponse updateDepartment(Long departmentId, DepartmentUpdateRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new DepartmentNotFoundException(departmentId));

        departmentRepository.findByCode(request.code())
                .filter(other -> !other.getId().equals(departmentId))
                .ifPresent(other -> {
                    throw new DuplicateDepartmentCodeException(request.code());
                });

        department.update(request.code(), request.name());

        return DepartmentResponse.from(department);
    }

    public void deactivateDepartment(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new DepartmentNotFoundException(departmentId));

        long memberCount = userRepository.countByDepartment_IdAndStatusNot(departmentId, UserStatus.DELETED);
        if (memberCount > 0) {
            throw new BusinessException("소속된 사용자가 있어 삭제할 수 없습니다.", ErrorCode.CONFLICT);
        }

        department.deactivate();
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }
}