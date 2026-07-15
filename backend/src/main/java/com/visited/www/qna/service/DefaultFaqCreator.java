package com.visited.www.qna.service;

import com.visited.www.doc.entity.Category;
import com.visited.www.doc.entity.Faq;
import com.visited.www.doc.repository.CategoryRepository;
import com.visited.www.doc.repository.FaqRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * QNA → FAQ 전환 시 실제로 B모듈(DOC)의 faqs 테이블에 FAQ를 생성하는 구현체.
 * (B파트 FaqService/Repository merge 완료로 임시 구현 TempFaqCreator를 대체)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultFaqCreator implements FaqCreator {

    private final FaqRepository faqRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Long createFaq(Long faqCategoryId, String question, String answer) {
        Category category = categoryRepository.findById(faqCategoryId).orElse(null);
        if (category == null) {
            log.warn("FAQ 전환 실패: 존재하지 않는 카테고리. faqCategoryId={}", faqCategoryId);
            return null;
        }
        Faq faq = faqRepository.save(Faq.builder()
                .category(category)
                .question(question)
                .answer(answer)
                .isPublic(true)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build());
        log.info("FAQ 생성 완료. faqId={}, categoryId={}", faq.getId(), faqCategoryId);
        return faq.getId();
    }
}
