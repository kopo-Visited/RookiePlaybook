package com.visited.www.doc.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 문서 카테고리
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "view_count", nullable = false)
    private Long viewCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "document", fetch = FetchType.LAZY)
    private List<DocumentTag> documentTags = new ArrayList<>();

    public void update(Category category, String title, String content, Boolean isPublic) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.isPublic = isPublic;
    }

    public void softDelete() {
        this.status = "DELETED";
    }

    @PrePersist
    protected void onCreate() {
        this.isPublic = this.isPublic == null ? true : this.isPublic;
        this.status = this.status == null ? "ACTIVE" : this.status;
        this.viewCount = this.viewCount == null ? 0L : this.viewCount;
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}