package com.visited.www.ai.service;

import com.visited.www.ai.dto.AiAnswerResponse;
import com.visited.www.ai.dto.AiAskRequest;
import com.visited.www.doc.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiServiceImpl implements AiService {

    private final ChatClient chatClient;
    private final DocumentRepository documentRepository;

    @Autowired(required = false)
    private VectorStore vectorStore;

    public AiServiceImpl(ChatClient chatClient, DocumentRepository documentRepository) {
        this.chatClient = chatClient;
        this.documentRepository = documentRepository;
    }

    private static final String ACTIVE = "ACTIVE";

    @Override
    public AiAnswerResponse ask(AiAskRequest request) {
        String userMessage = buildUserMessage(request.getQuestion());

        String answer = chatClient.prompt()
                .user(userMessage)
                .call()
                .content();

        return new AiAnswerResponse(answer);
    }

    private String buildUserMessage(String question) {
        if (vectorStore == null) {
            return question;
        }

        List<Document> relevantDocs = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(5)
                        .build()
        );

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
                .map(doc -> new Document(
                        "doc-" + doc.getId(),
                        doc.getTitle() + "\n" + doc.getContent(),
                        Map.of(
                                "documentId", doc.getId().toString(),
                                "title", doc.getTitle()
                        )
                ))
                .toList();

        if (!aiDocs.isEmpty()) {
            vectorStore.add(aiDocs);
        }
    }
}