package com.visited.www.doc.service;

import com.visited.www.doc.dto.response.DocumentResponse;

import java.util.List;

public interface DocumentService {

    List<DocumentResponse> getDocuments();

    DocumentResponse getDocument(Long id);

    List<DocumentResponse> searchDocuments(String keyword);
}