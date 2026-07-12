package com.visited.www.doc.service;

import com.visited.www.doc.dto.request.DocumentCreateRequest;
import com.visited.www.doc.dto.request.DocumentUpdateRequest;
import com.visited.www.doc.dto.response.DocumentResponse;
import com.visited.www.doc.entity.Category;
import com.visited.www.doc.entity.Document;
import com.visited.www.doc.exception.CategoryNotFoundException;
import com.visited.www.doc.exception.DocumentNotFoundException;
import com.visited.www.doc.repository.CategoryRepository;
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
    private final CategoryRepository categoryRepository;

    @Override
    public List<DocumentResponse> getDocuments() {
        return documentRepository.findByStatusAndIsPublicTrueOrderByCreatedAtDesc(ACTIVE_STATUS)
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Override
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findByStatusOrderByCreatedAtDesc(ACTIVE_STATUS)
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public DocumentResponse getDocument(Long id) {
        Document document = documentRepository.findByIdAndStatusAndIsPublicTrue(id, ACTIVE_STATUS)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        document.increaseViewCount();
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

    @Override
    @Transactional
    public DocumentResponse createDocument(DocumentCreateRequest request) {
        Category category = categoryRepository.findByCategoryName(request.getCategoryName())
                .orElseThrow(() -> new CategoryNotFoundException(request.getCategoryName()));

        Document document = Document.builder()
                .category(category)
                .title(request.getTitle())
                .content(request.getContent())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .build();

        Document saved = documentRepository.save(document);
        return DocumentResponse.from(saved);
    }

    @Override
    @Transactional
    public DocumentResponse updateDocument(Long id, DocumentUpdateRequest request) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        Category category = categoryRepository.findByCategoryName(request.getCategoryName())
                .orElseThrow(() -> new CategoryNotFoundException(request.getCategoryName()));

        document.update(category, request.getTitle(), request.getContent(),
                request.getIsPublic() != null ? request.getIsPublic() : document.getIsPublic());

        return DocumentResponse.from(document);
    }

    @Override
    @Transactional
    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        document.softDelete();
    }

    @Override
    @Transactional
    public DocumentResponse reviewDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        document.markAsReviewed();
        return DocumentResponse.from(document);
    }
}