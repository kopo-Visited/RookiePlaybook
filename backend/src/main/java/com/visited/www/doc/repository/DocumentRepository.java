package com.visited.www.doc.repository;

import com.visited.www.doc.entity.Document;
import com.visited.www.statistics.dto.response.CategoryDistributionDto;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByStatusAndIsPublicTrueOrderByCreatedAtDesc(String status);

    Optional<Document> findByIdAndStatusAndIsPublicTrue(Long id, String status);

    List<Document> findByTitleContainingIgnoreCaseAndStatusAndIsPublicTrueOrderByCreatedAtDesc(
            String title,
            String status
    );

    long countByCreatedAtBefore(LocalDateTime dateTime);

    @Query("SELECT new com.visited.www.statistics.dto.response.CategoryDistributionDto(c.categoryName, COUNT(d)) "
            + "FROM Document d JOIN d.category c "
            + "GROUP BY c.categoryName "
            + "ORDER BY COUNT(d) DESC")
    List<CategoryDistributionDto> countDocumentsByCategory();
}