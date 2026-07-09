package com.visited.www.inquiry.repository;

import com.visited.www.inquiry.entity.Inquiry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findAllByWriterIdOrderByCreatedAtDesc(Long writerId);

    List<Inquiry> findAllByOrderByCreatedAtDesc();
}
