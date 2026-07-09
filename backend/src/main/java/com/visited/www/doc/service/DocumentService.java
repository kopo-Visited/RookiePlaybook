package com.visited.www.doc.service;

import com.visited.www.doc.dto.request.DocumentCreateRequest;
import com.visited.www.doc.dto.request.DocumentUpdateRequest;
import com.visited.www.doc.dto.response.DocumentResponse;

import java.util.List;

public interface DocumentService {

    List<DocumentResponse> getDocuments();

    DocumentResponse getDocument(Long id);

    List<DocumentResponse> searchDocuments(String keyword);

    DocumentResponse createDocument(DocumentCreateRequest request);

    DocumentResponse updateDocument(Long id, DocumentUpdateRequest request);

    void deleteDocument(Long id);
}