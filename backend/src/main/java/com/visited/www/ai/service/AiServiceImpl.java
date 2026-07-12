package com.visited.www.ai.service;

import com.visited.www.ai.dto.AiAnswerResponse;
import com.visited.www.ai.dto.AiAskRequest;
import com.visited.www.ai.exception.AiResponseException;
import com.visited.www.doc.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public
class AiServiceImpl implements AiService {

    private final DocumentRepository documentRepository;

    @Autowired(required = false)
    private ChatClient chatClient;

    @Autowired(required = false)
    private VectorStore vectorStore;

    public AiServiceImpl(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    private static final String ACTIVE = "ACTIVE";

    @Async
    @EventListener(ApplicationReadyEvent.class)
    @Transactional(readOnly = true)
    public void onApplicationReady() {
        try {
            indexAllDocuments();
        } catch (RuntimeException e) {
            log.error("시작 시 문서 벡터 인덱싱 실패 — GOOGLE_API_KEY 설정 또는 임베딩 모델을 확인하세요.", e);
        }
    }

    @Override
    public AiAnswerResponse ask(AiAskRequest request) {
        if (chatClient == null) {
            throw new AiResponseException(
                    new IllegalStateException("AI 기능이 비활성화되어 있습니다 (spring.ai.enabled=false).")
            );
        }

        String userMessage = buildUserMessage(request.getQuestion());

        String answer;
        try {
            answer = chatClient.prompt()
                    .user(userMessage)
                    .call()
                    .content();
        } catch (RuntimeException e) {
            throw new AiResponseException(e);
        }

        return new AiAnswerResponse(answer);
    }

    private String buildUserMessage(String question) {
        if (vectorStore == null) {
            return question;
        }

        List<Document> relevantDocs;
        try {
            relevantDocs = vectorStore.similaritySearch(
                    SearchRequest.builder()
                            .query(question)
                            .topK(5)
                            .build()
            );
        } catch (RuntimeException e) {
            log.warn("벡터 검색 실패, 컨텍스트 없이 질문만 전달합니다.", e);
            return question;
        }

        if (relevantDocs.isEmpty()) {
            return question;
        }

        String context = relevantDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        return String.format(
                "아래 사내 문서를 참고해서 답변하세요.\n\n[참고 문서]\n%s\n\n[질문]\n%s",
                context, question
        );
    }

    @Override
    @Transactional(readOnly = true)
    public void indexAllDocuments() {
        if (vectorStore == null) {
            return;
        }

        List<Document> aiDocs = documentRepository
                .findByStatusAndIsPublicTrueOrderByCreatedAtDesc(ACTIVE)
                .stream()
                .map(this::toAiDocument)
                .toList();

        if (!aiDocs.isEmpty()) {
            try {
                vectorStore.add(aiDocs);
                log.info("문서 {}건 벡터 인덱싱 완료", aiDocs.size());
            } catch (RuntimeException e) {
                log.error("벡터 인덱싱 실패: 문서 {}건 처리 중 오류 발생", aiDocs.size(), e);
                throw new AiResponseException(e);
            }
        } else {
            log.warn("벡터 인덱싱: 공개 ACTIVE 문서가 없습니다.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void indexDocument(Long documentId) {
        if (vectorStore == null) {
            return;
        }
        documentRepository.findById(documentId).ifPresent(doc -> {
            if (!ACTIVE.equals(doc.getStatus()) || !Boolean.TRUE.equals(doc.getIsPublic())) {
                return;
            }
            try {
                vectorStore.delete(List.of("doc-" + documentId));
            } catch (RuntimeException e) {
                log.warn("기존 벡터 삭제 실패 (무시): documentId={}", documentId);
            }
            try {
                vectorStore.add(List.of(toAiDocument(doc)));
                log.info("문서 벡터 인덱싱 완료: documentId={}", documentId);
            } catch (RuntimeException e) {
                log.error("문서 벡터 인덱싱 실패: documentId={}", documentId, e);
            }
        });
    }

    @Override
    public void removeDocument(Long documentId) {
        if (vectorStore == null) {
            return;
        }
        try {
            vectorStore.delete(List.of("doc-" + documentId));
            log.info("문서 벡터 삭제 완료: documentId={}", documentId);
        } catch (RuntimeException e) {
            log.warn("문서 벡터 삭제 실패 (무시): documentId={}", documentId);
        }
    }

    private Document toAiDocument(com.visited.www.doc.entity.Document doc) {
        return new Document(
                "doc-" + doc.getId(),
                doc.getTitle() + "\n" + doc.getContent(),
                Map.of(
                        "documentId", doc.getId().toString(),
                        "title", doc.getTitle()
                )
        );
    }
}