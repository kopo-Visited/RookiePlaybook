package com.visited.www.qna.entity;

import com.visited.www.qna.enums.QuestionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@Table(name = "questions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@SQLDelete(sql = "UPDATE questions SET is_deleted = true, deleted_at = NOW() WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 질문 작성자 users.id.
     * A파트 User Entity가 merge되면 @ManyToOne(User)로 변경하고 FK를 건다.
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_category_id", nullable = false)
    private QuestionCategory category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuestionStatus status = QuestionStatus.RECEIVED;

    /**
     * FAQ 전환 시 생성된 faqs.id (B모듈 소유 테이블).
     * B파트 Faq Entity가 merge되기 전까지 ID만 보관한다. UNIQUE로 중복 전환을 막는다.
     */
    @Column(name = "converted_faq_id", unique = true)
    private Long convertedFaqId;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    private Question(Long userId, QuestionCategory category, String title, String content) {
        this.userId = userId;
        this.category = category;
        this.title = title;
        this.content = content;
        this.status = QuestionStatus.RECEIVED;
    }

    public void update(QuestionCategory category, String title, String content) {
        this.category = category;
        this.title = title;
        this.content = content;
    }

    public void changeStatus(QuestionStatus status) {
        this.status = status;
    }

    public void convertToFaq(Long faqId) {
        this.convertedFaqId = faqId;
    }

    public boolean isWriter(Long userId) {
        return this.userId.equals(userId);
    }

    public boolean isEditable() {
        return this.status == QuestionStatus.RECEIVED;
    }

    public boolean isConverted() {
        return this.convertedFaqId != null;
    }
}
