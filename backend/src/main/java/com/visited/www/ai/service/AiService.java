package com.visited.www.ai.service;

import com.visited.www.ai.dto.AiAnswerResponse;
import com.visited.www.ai.dto.AiAskRequest;

public interface AiService {

    AiAnswerResponse ask(AiAskRequest request);

    void indexAllDocuments();

    void indexDocument(Long documentId);

    void removeDocument(Long documentId);
}
