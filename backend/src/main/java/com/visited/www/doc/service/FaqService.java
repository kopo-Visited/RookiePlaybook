package com.visited.www.doc.service;

import com.visited.www.doc.dto.response.FaqResponse;

import java.util.List;

public interface FaqService {

    List<FaqResponse> getFaqs();
}