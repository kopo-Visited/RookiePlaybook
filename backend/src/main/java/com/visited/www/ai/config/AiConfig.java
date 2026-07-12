package com.visited.www.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(@Qualifier("openAiChatModel") ChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultSystem("""
                        당신은 신입사원 온보딩을 돕는 AI 어시스턴트입니다.
                        제공된 사내 문서를 기반으로 질문에 답변하세요.
                        문서에 관련 내용이 없으면 '관련 문서를 찾을 수 없습니다.'라고 답하세요.
                        답변은 항상 한국어로 하세요.
                        """)
                .build();
    }

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return SimpleVectorStore.builder(embeddingModel).build();
    }
}
