package com.visited.www.edu.mapper;

import com.visited.www.edu.dto.mapper.EducationProgressDto;
import com.visited.www.edu.dto.mapper.StageWithProgressDto;
import org.springframework.data.repository.query.Param;
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
}
