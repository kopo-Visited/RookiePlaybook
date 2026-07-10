package com.visited.www.ai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.verify;

import com.visited.www.ai.dto.AiAnswerResponse;
import com.visited.www.ai.dto.AiAskRequest;
import com.visited.www.ai.exception.AiResponseException;
import com.visited.www.doc.entity.Document;
import com.visited.www.doc.repository.DocumentRepository;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AiServiceImplTest {

    @InjectMocks
    private AiServiceImpl aiService;

    @Mock
    private ChatClient chatClient;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private VectorStore vectorStore;

    @Mock
    private ChatClient.ChatClientRequestSpec requestSpec;

    @Mock
    private ChatClient.CallResponseSpec callResponseSpec;

    private AiAskRequest askRequest(String question) {
        AiAskRequest request = new AiAskRequest();
        ReflectionTestUtils.setField(request, "question", question);
        return request;
    }

    private void stubChatClient(String answer) {
        given(chatClient.prompt()).willReturn(requestSpec);
        given(requestSpec.user(anyString())).willReturn(requestSpec);
        given(requestSpec.call()).willReturn(callResponseSpec);
        given(callResponseSpec.content()).willReturn(answer);
    }

    @Test
    @DisplayName("벡터스토어가 없으면 질문 그대로 AI에 전달해 답변을 반환한다")
    void ask_withoutVectorStore_returnsAnswer() {
        ReflectionTestUtils.setField(aiService, "vectorStore", null);
        stubChatClient("답변입니다.");

        AiAnswerResponse response = aiService.ask(askRequest("VPN 연결이 안 돼요"));

        assertThat(response.getAnswer()).isEqualTo("답변입니다.");
        verify(requestSpec).user("VPN 연결이 안 돼요");
    }

    @Test
    @DisplayName("AI 호출이 실패하면 AiResponseException으로 변환된다")
    void ask_chatClientFails_throwsAiResponseException() {
        ReflectionTestUtils.setField(aiService, "vectorStore", null);
        given(chatClient.prompt()).willReturn(requestSpec);
        given(requestSpec.user(anyString())).willReturn(requestSpec);
        given(requestSpec.call()).willThrow(new RuntimeException("OpenAI API 호출 실패"));

        assertThatThrownBy(() -> aiService.ask(askRequest("질문")))
                .isInstanceOf(AiResponseException.class);
    }

    @Test
    @DisplayName("벡터 검색이 실패해도 질문만으로 답변을 반환한다")
    void ask_vectorSearchFails_fallsBackToPlainQuestion() {
        ReflectionTestUtils.setField(aiService, "vectorStore", vectorStore);
        given(vectorStore.similaritySearch(any(SearchRequest.class)))
                .willThrow(new RuntimeException("벡터 DB 연결 실패"));
        stubChatClient("답변입니다.");

        AiAnswerResponse response = aiService.ask(askRequest("질문"));

        assertThat(response.getAnswer()).isEqualTo("답변입니다.");
        verify(requestSpec).user("질문");
    }

    @Test
    @DisplayName("문서 색인 중 벡터스토어 저장이 실패하면 AiResponseException이 발생한다")
    void indexAllDocuments_vectorStoreAddFails_throwsAiResponseException() {
        ReflectionTestUtils.setField(aiService, "vectorStore", vectorStore);
        Document document = Document.builder().title("제목").content("내용").build();
        ReflectionTestUtils.setField(document, "id", 1L);

        given(documentRepository.findByStatusAndIsPublicTrueOrderByCreatedAtDesc("ACTIVE"))
                .willReturn(List.of(document));
        willThrow(new RuntimeException("벡터 DB 저장 실패")).given(vectorStore).add(any());

        assertThatThrownBy(() -> aiService.indexAllDocuments())
                .isInstanceOf(AiResponseException.class);
    }
}
