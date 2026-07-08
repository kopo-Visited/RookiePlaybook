package com.visited.www.doc.service;

import com.visited.www.doc.dto.response.FaqResponse;
import com.visited.www.doc.repository.FaqRepository;
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

    @Override
    public List<FaqResponse> getFaqs() {
        return faqRepository.findByStatusAndIsPublicTrueOrderByCreatedAtDesc(ACTIVE_STATUS)
                .stream()
                .map(FaqResponse::from)
                .toList();
    }
}