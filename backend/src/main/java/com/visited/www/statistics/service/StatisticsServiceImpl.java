package com.visited.www.statistics.service;

import com.visited.www.doc.repository.DocumentRepository;
import com.visited.www.entity.User;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.repository.QuestionRepository;
import com.visited.www.statistics.dto.response.DashboardStatsResponseDto;
import com.visited.www.statistics.dto.response.HourlyAccessDto;
import com.visited.www.statistics.dto.response.RecentDocumentDto;
import com.visited.www.statistics.dto.response.RecentQuestionDto;
import com.visited.www.statistics.dto.response.RecentUserDto;
import com.visited.www.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final QuestionRepository questionRepository;

    @Override
    public DashboardStatsResponseDto getDashboardStats() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);

        long totalUsers = userRepository.count();
        long usersAWeekAgo = userRepository.countByCreatedAtBefore(weekAgo);

        long totalDocuments = documentRepository.count();
        long documentsAWeekAgo = documentRepository.countByCreatedAtBefore(weekAgo);

        long unansweredQuestions = questionRepository.count()
                - questionRepository.countByStatus(QuestionStatus.ANSWERED);

        return new DashboardStatsResponseDto(
                totalUsers,
                growthRatePercent(totalUsers, usersAWeekAgo),
                totalDocuments,
                growthRatePercent(totalDocuments, documentsAWeekAgo),
                unansweredQuestions,
                documentRepository.countDocumentsByCategory(),
                buildAccessTrend(userRepository.findAllLastLoginTimestamps()),
                userRepository.findTop5ByOrderByCreatedAtDesc().stream()
                        .map(RecentUserDto::from)
                        .toList(),
                documentRepository.findTop3ByOrderByCreatedAtDesc().stream()
                        .map(RecentDocumentDto::from)
                        .toList(),
                buildRecentQuestions(questionRepository.findTop3ByOrderByCreatedAtDesc())
        );
    }

    /** Question은 User와 연관관계 없이 userId만 갖고 있어 writer를 별도로 배치 조회한다. */
    private List<RecentQuestionDto> buildRecentQuestions(List<Question> questions) {
        Map<Long, User> writerById = userRepository.findAllById(
                questions.stream().map(Question::getUserId).distinct().toList()
        ).stream().collect(Collectors.toMap(User::getId, Function.identity()));

        return questions.stream()
                .map(question -> RecentQuestionDto.from(question, writerById.get(question.getUserId())))
                .toList();
    }

    private double growthRatePercent(long current, long previous) {
        if (previous == 0) {
            return 0.0;
        }
        double rate = ((double) (current - previous) / previous) * 100;
        return Math.round(rate * 10) / 10.0;
    }

    /** 접속 로그 테이블이 없어 사용자별 마지막 로그인 시각을 시간대로 묶은 근사치다. */
    private List<HourlyAccessDto> buildAccessTrend(List<LocalDateTime> lastLoginTimestamps) {
        Map<Integer, Long> countsByHour = lastLoginTimestamps.stream()
                .collect(Collectors.groupingBy(LocalDateTime::getHour, Collectors.counting()));

        return IntStream.range(0, 24)
                .mapToObj(hour -> new HourlyAccessDto(hour, countsByHour.getOrDefault(hour, 0L)))
                .toList();
    }
}
