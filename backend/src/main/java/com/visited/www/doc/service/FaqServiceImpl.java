package com.visited.www.doc.service;

import com.visited.www.doc.dto.request.FaqRequest;
import com.visited.www.doc.dto.response.FaqResponse;
import com.visited.www.doc.entity.Category;
import com.visited.www.doc.entity.Faq;
import com.visited.www.doc.repository.CategoryRepository;
import com.visited.www.doc.repository.FaqRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqServiceImpl implements FaqService {

    private static final String ACTIVE_STATUS = "ACTIVE";

    private final FaqRepository faqRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<FaqResponse> getFaqs() {
        return faqRepository.findByStatusAndIsPublicTrueOrderByCreatedAtDesc(ACTIVE_STATUS)
                .stream()
                .map(FaqResponse::from)
                .toList();
    }

    @Override
    public List<FaqResponse> getAllFaqs() {
        return faqRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(FaqResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public FaqResponse createFaq(FaqRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("카테고리를 찾을 수 없습니다."));
        Faq faq = Faq.builder()
                .category(category)
                .question(request.getQuestion())
                .answer(request.getAnswer())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .status(ACTIVE_STATUS)
                .build();
        return FaqResponse.from(faqRepository.save(faq));
    }

    @Override
    @Transactional
    public FaqResponse updateFaq(Long id, FaqRequest request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FAQ를 찾을 수 없습니다."));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("카테고리를 찾을 수 없습니다."));
        faq.update(category, request.getQuestion(), request.getAnswer(),
                request.getIsPublic() != null ? request.getIsPublic() : faq.getIsPublic());
        return FaqResponse.from(faq);
    }

    @Override
    @Transactional
    public void deleteFaq(Long id) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FAQ를 찾을 수 없습니다."));
        faqRepository.delete(faq);
    }
}