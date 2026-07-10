package com.visited.www.qna.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

/**
 * 질문 내용을 기반으로 카테고리를 한 번 더 추론(제안)하는 AI 분류기.
 * 사용자가 고른 카테고리를 덮어쓰지 않고 "제안"만 한다.
 * AI(ChatClient)가 없거나 호출이 실패하면 null을 반환해 질문 등록 흐름을 막지 않는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiCategoryClassifier {

    private final ObjectProvider<ChatClient> chatClientProvider;

    /**
     * @return 카테고리 목록 중 가장 적합하다고 판단한 이름. 판단 불가/실패 시 null
     */
    public String suggest(String title, String content, List<String> categoryNames) {
        ChatClient chatClient = chatClientProvider.getIfAvailable();
        if (chatClient == null || categoryNames == null || categoryNames.isEmpty()) {
            return null;
        }
        try {
            String joined = String.join(", ", categoryNames);
            String raw = chatClient.prompt()
                    .system("""
                            너는 사내 질문을 카테고리로 분류하는 분류기다.
                            반드시 주어진 카테고리 목록 중 하나의 '이름'만 출력한다.
                            부연 설명, 문장, 기호 없이 카테고리 이름만 답한다.
                            """)
                    .user(String.format(
                            "카테고리 목록: [%s]%n%n제목: %s%n내용: %s%n%n가장 적합한 카테고리 이름 하나만 답하라.",
                            joined, title, content))
                    .call()
                    .content();
            if (raw == null) {
                return null;
            }
            String answer = raw.trim();
            for (String c : categoryNames) {
                if (answer.equals(c)) {
                    return c;
                }
            }
            for (String c : categoryNames) {
                if (answer.contains(c)) {
                    return c;
                }
            }
            return null;
        } catch (Exception e) {
            log.warn("AI 카테고리 분류 실패(무시하고 진행): {}", e.getMessage());
            return null;
        }
    }
}
