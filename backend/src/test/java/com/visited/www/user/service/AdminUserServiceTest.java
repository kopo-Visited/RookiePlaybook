package com.visited.www.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.visited.www.entity.Department;
import com.visited.www.entity.Role;
import com.visited.www.entity.User;
import com.visited.www.entity.UserStatus;
import com.visited.www.global.exception.BusinessException;
import com.visited.www.user.dto.request.DepartmentCreateRequest;
import com.visited.www.user.dto.request.DepartmentUpdateRequest;
import com.visited.www.user.dto.request.UserCreateRequest;
import com.visited.www.user.dto.request.UserRoleUpdateRequest;
import com.visited.www.user.dto.response.UserResponse;
import com.visited.www.user.exception.DepartmentNotFoundException;
import com.visited.www.user.exception.DuplicateDepartmentCodeException;
import com.visited.www.user.exception.DuplicateEmailException;
import com.visited.www.user.exception.DuplicateEmployeeNoException;
import com.visited.www.user.exception.RoleNotFoundException;
import com.visited.www.user.exception.UserNotFoundException;
import com.visited.www.user.repository.DepartmentRepository;
import com.visited.www.user.repository.RoleRepository;
import com.visited.www.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @InjectMocks
    private AdminUserService adminUserService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserCreateRequest createRequest() {
        return new UserCreateRequest(
                "홍길동", "hong@visited.com", "0000", 1L, 1L, "사원", "EMP001", "010-0000-0000", UserStatus.ACTIVE);
    }

    private User existingUser() {
        Department department = Department.builder().name("개발팀").build();
        ReflectionTestUtils.setField(department, "id", 1L);
        Role role = Role.builder().code("ROLE_USER").name("일반 사용자").build();
        ReflectionTestUtils.setField(role, "id", 1L);

        User user = User.builder()
                .name("홍길동")
                .employeeNo("EMP001")
                .status(UserStatus.ACTIVE)
                .department(department)
                .role(role)
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);
        return user;
    }

    @Test
    @DisplayName("이메일이 중복되면 DuplicateEmailException이 발생한다")
    void createUser_duplicateEmail() {
        given(userRepository.existsByEmail(createRequest().email())).willReturn(true);

        assertThatThrownBy(() -> adminUserService.createUser(createRequest()))
                .isInstanceOf(DuplicateEmailException.class);
    }

    @Test
    @DisplayName("사번이 중복되면 DuplicateEmployeeNoException이 발생한다")
    void createUser_duplicateEmployeeNo() {
        given(userRepository.existsByEmail(createRequest().email())).willReturn(false);
        given(userRepository.existsByEmployeeNo(createRequest().employeeNo())).willReturn(true);

        assertThatThrownBy(() -> adminUserService.createUser(createRequest()))
                .isInstanceOf(DuplicateEmployeeNoException.class);
    }

    @Test
    @DisplayName("존재하지 않는 부서로 등록하면 DepartmentNotFoundException이 발생한다")
    void createUser_departmentNotFound() {
        given(userRepository.existsByEmail(createRequest().email())).willReturn(false);
        given(userRepository.existsByEmployeeNo(createRequest().employeeNo())).willReturn(false);
        given(departmentRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.createUser(createRequest()))
                .isInstanceOf(DepartmentNotFoundException.class);
    }

    @Test
    @DisplayName("존재하지 않는 권한으로 등록하면 RoleNotFoundException이 발생한다")
    void createUser_roleNotFound() {
        given(userRepository.existsByEmail(createRequest().email())).willReturn(false);
        given(userRepository.existsByEmployeeNo(createRequest().employeeNo())).willReturn(false);
        given(departmentRepository.findById(1L)).willReturn(Optional.of(Department.builder().build()));
        given(roleRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.createUser(createRequest()))
                .isInstanceOf(RoleNotFoundException.class);
    }

    @Test
    @DisplayName("존재하지 않는 부서 코드로 부서를 등록하려 하면 부서 코드 중복 확인은 통과하고, 중복이면 DuplicateDepartmentCodeException이 발생한다")
    void createDepartment_duplicateCode() {
        DepartmentCreateRequest request = new DepartmentCreateRequest("DEV", "개발팀");
        given(departmentRepository.existsByCode("DEV")).willReturn(true);

        assertThatThrownBy(() -> adminUserService.createDepartment(request))
                .isInstanceOf(DuplicateDepartmentCodeException.class);
    }

    @Test
    @DisplayName("존재하지 않는 부서를 수정하려 하면 DepartmentNotFoundException이 발생한다")
    void updateDepartment_notFound() {
        given(departmentRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() ->
                        adminUserService.updateDepartment(999L, new DepartmentUpdateRequest("DEV", "변경팀")))
                .isInstanceOf(DepartmentNotFoundException.class);
    }

    @Test
    @DisplayName("다른 부서가 이미 쓰고 있는 코드로 변경하려 하면 DuplicateDepartmentCodeException이 발생한다")
    void updateDepartment_duplicateCode() {
        Department department = Department.builder().code("DEV").name("개발팀").build();
        ReflectionTestUtils.setField(department, "id", 1L);
        Department other = Department.builder().code("QA").name("품질팀").build();
        ReflectionTestUtils.setField(other, "id", 2L);

        given(departmentRepository.findById(1L)).willReturn(Optional.of(department));
        given(departmentRepository.findByCode("QA")).willReturn(Optional.of(other));

        assertThatThrownBy(() -> adminUserService.updateDepartment(1L, new DepartmentUpdateRequest("QA", "개발팀")))
                .isInstanceOf(DuplicateDepartmentCodeException.class);
    }

    @Test
    @DisplayName("자기 자신의 코드로 그대로 수정하면 중복 예외 없이 정상 처리된다")
    void updateDepartment_sameCodeAsSelf() {
        Department department = Department.builder().code("DEV").name("개발팀").build();
        ReflectionTestUtils.setField(department, "id", 1L);

        given(departmentRepository.findById(1L)).willReturn(Optional.of(department));
        given(departmentRepository.findByCode("DEV")).willReturn(Optional.of(department));

        adminUserService.updateDepartment(1L, new DepartmentUpdateRequest("DEV", "개발본부"));

        assertThat(department.getName()).isEqualTo("개발본부");
    }

    @Test
    @DisplayName("소속된 사용자가 있는 부서를 삭제하려 하면 BusinessException이 발생한다")
    void deactivateDepartment_hasMembers() {
        Department department = Department.builder().code("DEV").name("개발팀").build();
        ReflectionTestUtils.setField(department, "id", 1L);

        given(departmentRepository.findById(1L)).willReturn(Optional.of(department));
        given(userRepository.countByDepartment_IdAndStatusNot(1L, UserStatus.DELETED)).willReturn(1L);

        assertThatThrownBy(() -> adminUserService.deactivateDepartment(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("소속된 사용자가 없는 부서는 정상적으로 삭제(비활성화)된다")
    void deactivateDepartment_success() {
        Department department = Department.builder().code("DEV").name("개발팀").build();
        ReflectionTestUtils.setField(department, "id", 1L);

        given(departmentRepository.findById(1L)).willReturn(Optional.of(department));
        given(userRepository.countByDepartment_IdAndStatusNot(1L, UserStatus.DELETED)).willReturn(0L);

        adminUserService.deactivateDepartment(1L);

        assertThat(department.isActive()).isFalse();
    }

    @Test
    @DisplayName("존재하지 않는 부서를 삭제하려 하면 DepartmentNotFoundException이 발생한다")
    void deactivateDepartment_notFound() {
        given(departmentRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.deactivateDepartment(999L))
                .isInstanceOf(DepartmentNotFoundException.class);
    }

    @Test
    @DisplayName("존재하지 않는 사용자를 조회하면 UserNotFoundException이 발생한다")
    void getMyInfo_userNotFound() {
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.getMyInfo(999L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    @DisplayName("존재하지 않는 권한으로 변경하면 RoleNotFoundException이 발생한다")
    void updateUserRole_roleNotFound() {
        given(userRepository.findById(1L)).willReturn(Optional.of(existingUser()));
        given(roleRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.updateUserRole(1L, new UserRoleUpdateRequest(1L)))
                .isInstanceOf(RoleNotFoundException.class);
    }

    @Test
    @DisplayName("사용자를 삭제하면 상태가 DELETED로 바뀐다")
    void deleteUser_success() {
        User user = existingUser();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        UserResponse response = adminUserService.deleteUser(1L, 2L);

        assertThat(response.status()).isEqualTo(UserStatus.DELETED.name());
    }

    @Test
    @DisplayName("본인 계정을 삭제하려 하면 BusinessException이 발생한다")
    void deleteUser_self() {
        assertThatThrownBy(() -> adminUserService.deleteUser(1L, 1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("이미 삭제된 사용자를 다시 삭제하려 하면 BusinessException이 발생한다")
    void deleteUser_alreadyDeleted() {
        User user = User.builder().name("홍길동").employeeNo("EMP001").status(UserStatus.DELETED).build();
        ReflectionTestUtils.setField(user, "id", 1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        assertThatThrownBy(() -> adminUserService.deleteUser(1L, 2L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("존재하지 않는 사용자를 삭제하려 하면 UserNotFoundException이 발생한다")
    void deleteUser_userNotFound() {
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.deleteUser(999L, 1L))
                .isInstanceOf(UserNotFoundException.class);
    }
}
