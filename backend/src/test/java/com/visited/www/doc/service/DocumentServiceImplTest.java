package com.visited.www.doc.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.visited.www.doc.dto.request.DocumentCreateRequest;
import com.visited.www.doc.dto.request.DocumentUpdateRequest;
import com.visited.www.doc.entity.Document;
import com.visited.www.doc.exception.CategoryNotFoundException;
import com.visited.www.doc.exception.DocumentNotFoundException;
import com.visited.www.doc.repository.CategoryRepository;
import com.visited.www.doc.repository.DocumentRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class DocumentServiceImplTest {

    @InjectMocks
    private DocumentServiceImpl documentService;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private CategoryRepository categoryRepository;

    private DocumentCreateRequest createRequest(String categoryName) {
        DocumentCreateRequest request = new DocumentCreateRequest();
        ReflectionTestUtils.setField(request, "categoryName", categoryName);
        ReflectionTestUtils.setField(request, "title", "제목");
        ReflectionTestUtils.setField(request, "content", "내용");
        return request;
    }

    private DocumentUpdateRequest updateRequest(String categoryName) {
        DocumentUpdateRequest request = new DocumentUpdateRequest();
        ReflectionTestUtils.setField(request, "categoryName", categoryName);
        ReflectionTestUtils.setField(request, "title", "제목");
        ReflectionTestUtils.setField(request, "content", "내용");
        return request;
    }

    private Document document(Long id) {
        Document document = Document.builder().build();
        ReflectionTestUtils.setField(document, "id", id);
        return document;
    }

    @Test
    @DisplayName("존재하지 않는 문서를 조회하면 DocumentNotFoundException이 발생한다")
    void getDocument_notFound() {
        given(documentRepository.findByIdAndStatusAndIsPublicTrue(999L, "ACTIVE")).willReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.getDocument(999L))
                .isInstanceOf(DocumentNotFoundException.class);
    }

    @Test
    @DisplayName("존재하지 않는 카테고리로 문서를 등록하면 CategoryNotFoundException이 발생한다")
    void createDocument_categoryNotFound() {
        given(categoryRepository.findByCategoryName("없는카테고리")).willReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.createDocument(createRequest("없는카테고리")))
                .isInstanceOf(CategoryNotFoundException.class);
    }

    @Test
    @DisplayName("존재하지 않는 문서를 수정하면 DocumentNotFoundException이 발생한다")
    void updateDocument_notFound() {
        given(documentRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.updateDocument(999L, updateRequest("카테고리")))
                .isInstanceOf(DocumentNotFoundException.class);
    }

    @Test
    @DisplayName("존재하지 않는 카테고리로 문서를 수정하면 CategoryNotFoundException이 발생한다")
    void updateDocument_categoryNotFound() {
        given(documentRepository.findById(1L)).willReturn(Optional.of(document(1L)));
        given(categoryRepository.findByCategoryName("없는카테고리")).willReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.updateDocument(1L, updateRequest("없는카테고리")))
                .isInstanceOf(CategoryNotFoundException.class);
    }

    @Test
    @DisplayName("존재하지 않는 문서를 삭제하면 DocumentNotFoundException이 발생한다")
    void deleteDocument_notFound() {
        given(documentRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.deleteDocument(999L))
                .isInstanceOf(DocumentNotFoundException.class);
    }
}
