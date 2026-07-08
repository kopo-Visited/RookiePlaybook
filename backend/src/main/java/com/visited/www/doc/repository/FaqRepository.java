package com.visited.www.doc.repository;

import com.visited.www.doc.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByStatusAndIsPublicTrueOrderByCreatedAtDesc(String status);
}