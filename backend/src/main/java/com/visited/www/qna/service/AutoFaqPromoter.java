package com.visited.www.qna.service;

import com.visited.www.doc.entity.Category;
import com.visited.www.doc.repository.CategoryRepository;
import com.visited.www.qna.entity.Answer;
import com.visited.www.qna.entity.Question;
import com.visited.www.qna.enums.QuestionStatus;
import com.visited.www.qna.repository.AnswerRepository;
import com.visited.www.qna.repository.QuestionRepository;
import com.visited.www.user.repository.UserRepository;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 같은/비슷한 질문이 여러 사용자에게 반복되면 자동으로 FAQ로 승격시킨다.
 *
 * 기준: 새 질문과 "유사"한 질문을 올린 서로 다른 사용자 수가
 *       전체 사용자의 20%(최소 2명) 이상이면, 유사 질문 중 '답변이 있고 아직 전환 안 된' 질문 하나를 FAQ로 전환.
 *
 * 유사도: 제목 토큰 Jaccard >= 0.34 (임베딩/벡터가 없는 로컬에서도 동작하는 휴리스틱).
 * 실패는 무시하여 질문 등록 흐름을 막지 않는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AutoFaqPromoter {

    private static final double THRESHOLD_RATIO = 0.2;
    private static final double SIMILARITY = 0.34;

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FaqCreator faqCreator;

    @Transactional
    public void tryPromote(Question newQuestion) {
        try {
            Set<String> base = tokens(newQuestion.getTitle());
            if (base.isEmpty()) {
                return;
            }
            List<Question> similar = questionRepository.findAll().stream()
                    .filter(q -> jaccard(base, tokens(q.getTitle())) >= SIMILARITY)
                    .toList();

            long distinctUsers = similar.stream().map(Question::getUserId).distinct().count();
            long totalUsers = userRepository.count();
            long threshold = Math.max(2, (long) Math.ceil(THRESHOLD_RATIO * totalUsers));
            if (distinctUsers < threshold) {
                return;
            }

            // 유사 질문 중 '답변 있고 아직 FAQ로 전환 안 된' 질문 하나를 전환
            for (Question q : similar) {
                if (q.getStatus() != QuestionStatus.ANSWERED || q.isConverted()) {
                    continue;
                }
                Answer answer = answerRepository.findByQuestionId(q.getId()).orElse(null);
                if (answer == null) {
                    continue;
                }
                Long faqCategoryId = categoryRepository
                        .findByCategoryName(q.getCategory().getName())
                        .map(Category::getId).orElse(null);
                if (faqCategoryId == null) {
                    continue;
                }
                Long faqId = faqCreator.createFaq(faqCategoryId, q.getTitle(), answer.getContent());
                if (faqId != null) {
                    q.convertToFaq(faqId);
                    log.info("유사 질문 {}%(={}명/{}명) 임계 도달 → 자동 FAQ 전환. questionId={}, faqId={}",
                            (int) (THRESHOLD_RATIO * 100), distinctUsers, totalUsers, q.getId(), faqId);
                }
                return; // 한 번에 하나만 승격
            }
        } catch (Exception e) {
            log.warn("자동 FAQ 전환 처리 실패(무시): {}", e.getMessage());
        }
    }

    private Set<String> tokens(String text) {
        if (text == null) {
            return Set.of();
        }
        return Arrays.stream(text.toLowerCase().split("\\s+"))
                .map(t -> t.replaceAll("[^0-9a-z가-힣]", ""))
                .filter(t -> t.length() >= 2)
                .collect(Collectors.toSet());
    }

    private double jaccard(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) {
            return 0;
        }
        Set<String> inter = new HashSet<>(a);
        inter.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) inter.size() / union.size();
    }
}
