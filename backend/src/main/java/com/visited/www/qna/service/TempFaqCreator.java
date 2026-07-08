package com.visited.www.qna.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * B모듈 merge 전까지 사용하는 임시 구현체.
 * FAQ를 실제로 생성하지 않고 로그만 남긴다. B파트 FaqService가 merge되면 삭제한다.
 */
@Slf4j
@Component
public class TempFaqCreator implements FaqCreator {

    @Override
    public Long createFaq(Long faqCategoryId, String question, String answer) {
        log.warn("B모듈(FAQ) 미연동 상태. FAQ 생성 요청만 기록한다. faqCategoryId={}, question={}",
                faqCategoryId, question);
        return null;
    }
}
