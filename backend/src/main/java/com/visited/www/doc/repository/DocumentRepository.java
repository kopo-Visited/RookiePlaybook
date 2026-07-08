package com.visited.www.doc.repository;

import com.visited.www.doc.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByStatusAndIsPublicTrueOrderByCreatedAtDesc(String status);

    Optional<Document> findByIdAndStatusAndIsPublicTrue(Long id, String status);

    List<Document> findByTitleContainingIgnoreCaseAndStatusAndIsPublicTrueOrderByCreatedAtDesc(
            String title,
            String status
    );
}