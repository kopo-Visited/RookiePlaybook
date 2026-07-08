package com.visited.www.qna.service;

/**
 * FAQ 전환 시 B모듈(DOC)의 faqs 테이블에 FAQ를 생성하는 연동 지점.
 * B파트의 FaqService가 merge되면 이 인터페이스를 구현하거나 직접 호출로 교체한다.
 */
public interface FaqCreator {

    /**
     * FAQ를 생성하고 생성된 faqs.id를 반환한다.
     *
     * @return 생성된 FAQ ID. 아직 B모듈이 없어 연동 전이면 null
     */
    Long createFaq(Long faqCategoryId, String question, String answer);
}
