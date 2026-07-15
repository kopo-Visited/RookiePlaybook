package com.visited.www.doc.service;

import com.visited.www.doc.dto.request.FaqRequest;
import com.visited.www.doc.dto.response.FaqResponse;

import java.util.List;

public interface FaqService {

    List<FaqResponse> getFaqs();

    List<FaqResponse> getAllFaqs();

    FaqResponse createFaq(FaqRequest request);

    FaqResponse updateFaq(Long id, FaqRequest request);

    void deleteFaq(Long id);
}