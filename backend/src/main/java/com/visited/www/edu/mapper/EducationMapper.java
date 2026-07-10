package com.visited.www.edu.mapper;

import com.visited.www.edu.dto.mapper.AdminProgressDto;
import com.visited.www.edu.dto.mapper.EducationProgressDto;
import com.visited.www.edu.dto.mapper.IncompleteProgressDto;
import com.visited.www.edu.dto.mapper.StageWithProgressDto;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface EducationMapper {

    // EDU-FR-001: 과정별 진도 정보 한 번에 조회
    List<EducationProgressDto> findProgressByUserIdAndEducationIds(
            @Param("userId") Long userId,
            @Param("educationIds") List<Long> educationIds
    );

    // EDU-FR-002: 단계 목록 + 완료 여부 + 영상 시청 위치 한 번에 조회
    List<StageWithProgressDto> findStagesWithProgressByEducationIdAndUserId(
            @Param("educationId") Long educationId,
            @Param("userId") Long userId
    );

    // EDU-FR-009: 관리자 진도 현황 조회 (부서/과정/완료여부 필터 + 페이징)
    List<AdminProgressDto> findAdminProgress(
            @Param("departmentId") Long departmentId,
            @Param("educationId") Long educationId,
            @Param("isCompleted") Boolean isCompleted,
            @Param("size") int size,
            @Param("offset") long offset
    );

    // EDU-FR-009: 관리자 진도 현황 전체 건수 (필터 적용)
    long countAdminProgress(
            @Param("departmentId") Long departmentId,
            @Param("educationId") Long educationId,
            @Param("isCompleted") Boolean isCompleted
    );

    // EDU-FR-010: 미완료자 조회 (과정 필터 + 페이징)
    List<IncompleteProgressDto> findIncompleteProgress(
            @Param("educationId") Long educationId,
            @Param("size") int size,
            @Param("offset") long offset
    );

    // EDU-FR-010: 미완료자 전체 건수 (필터 적용)
    long countIncompleteProgress(
            @Param("educationId") Long educationId
    );

}
