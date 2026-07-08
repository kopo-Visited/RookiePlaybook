package com.visited.www.doc.service;

import com.visited.www.doc.dto.response.DocumentResponse;
import com.visited.www.doc.entity.Document;
import com.visited.www.doc.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentServiceImpl implements DocumentService {

    private static final String ACTIVE_STATUS = "ACTIVE";

    private final DocumentRepository documentRepository;

    @Override
    public List<DocumentResponse> getDocuments() {
        return documentRepository.findByStatusAndIsPublicTrueOrderByCreatedAtDesc(ACTIVE_STATUS)
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Override
    public DocumentResponse getDocument(Long id) {
        Document document = documentRepository.findByIdAndStatusAndIsPublicTrue(id, ACTIVE_STATUS)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다. id=" + id));

        return DocumentResponse.from(document);
    }

    @Override
    public List<DocumentResponse> searchDocuments(String keyword) {
        if (keyword == null || keyword.trim().isBlank()) {
            return List.of();
        }

        return documentRepository
                .findByTitleContainingIgnoreCaseAndStatusAndIsPublicTrueOrderByCreatedAtDesc(
                        keyword.trim(),
                        ACTIVE_STATUS
                )
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }
}