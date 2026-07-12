package com.visited.www.doc.controller;

import com.visited.www.doc.dto.request.DocumentCreateRequest;
import com.visited.www.doc.dto.request.DocumentUpdateRequest;
import com.visited.www.doc.dto.response.DocumentResponse;
import com.visited.www.doc.dto.response.FaqResponse;
import com.visited.www.doc.service.DocumentService;
import com.visited.www.doc.service.FaqService;
import com.visited.www.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final FaqService faqService;

    @GetMapping("/documents")
    public ApiResponse<List<DocumentResponse>> getDocuments() {
        List<DocumentResponse> response = documentService.getDocuments();
        return ApiResponse.success(response);
    }

    @GetMapping("/documents/{id}")
    public ApiResponse<DocumentResponse> getDocument(@PathVariable Long id) {
        DocumentResponse response = documentService.getDocument(id);
        return ApiResponse.success(response);
    }

    @GetMapping("/documents/search")
    public ApiResponse<List<DocumentResponse>> searchDocuments(@RequestParam("q") String keyword) {
        List<DocumentResponse> response = documentService.searchDocuments(keyword);
        return ApiResponse.success(response);
    }

    @GetMapping("/admin/documents")
    public ApiResponse<List<DocumentResponse>> getAllDocuments() {
        List<DocumentResponse> response = documentService.getAllDocuments();
        return ApiResponse.success(response);
    }

    @PostMapping("/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DocumentResponse> createDocument(@RequestBody DocumentCreateRequest request) {
        DocumentResponse response = documentService.createDocument(request);
        return ApiResponse.success(response);
    }

    @PutMapping("/documents/{id}")
    public ApiResponse<DocumentResponse> updateDocument(@PathVariable Long id,
                                                        @RequestBody DocumentUpdateRequest request) {
        DocumentResponse response = documentService.updateDocument(id, request);
        return ApiResponse.success(response);
    }

    @DeleteMapping("/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
    }

    @PatchMapping("/documents/{id}/review")
    public ApiResponse<DocumentResponse> reviewDocument(@PathVariable Long id) {
        DocumentResponse response = documentService.reviewDocument(id);
        return ApiResponse.success(response);
    }

    @GetMapping("/faqs")
    public ApiResponse<List<FaqResponse>> getFaqs() {
        List<FaqResponse> response = faqService.getFaqs();
        return ApiResponse.success(response);
    }
}