package com.visited.www.inquiry.service;

import com.visited.www.entity.User;
import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import com.visited.www.inquiry.dto.request.InquiryAnswerRequestDto;
import com.visited.www.inquiry.dto.request.InquiryCreateRequestDto;
import com.visited.www.inquiry.dto.response.InquiryResponseDto;
import com.visited.www.inquiry.entity.Inquiry;
import com.visited.www.inquiry.repository.InquiryRepository;
import com.visited.www.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    public InquiryResponseDto create(Long userId, InquiryCreateRequestDto request) {
        User writer = getUser(userId);

        Inquiry inquiry = Inquiry.builder()
                .writer(writer)
                .title(request.title())
                .content(request.content())
                .build();

        return InquiryResponseDto.from(inquiryRepository.save(inquiry));
    }

    @Transactional(readOnly = true)
    public List<InquiryResponseDto> getMyInquiries(Long userId) {
        return inquiryRepository.findAllByWriterIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(InquiryResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InquiryResponseDto getMyInquiry(Long userId, Long inquiryId) {
        Inquiry inquiry = findInquiry(inquiryId);
        if (!inquiry.getWriter().getId().equals(userId)) {
            throw new BusinessException("본인 문의만 조회할 수 있습니다.", ErrorCode.FORBIDDEN);
        }
        return InquiryResponseDto.from(inquiry);
    }

    @Transactional(readOnly = true)
    public List<InquiryResponseDto> getAllInquiries() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(InquiryResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InquiryResponseDto getInquiry(Long inquiryId) {
        return InquiryResponseDto.from(findInquiry(inquiryId));
    }

    public InquiryResponseDto answer(Long inquiryId, InquiryAnswerRequestDto request) {
        Inquiry inquiry = findInquiry(inquiryId);
        inquiry.answer(request.answer());
        return InquiryResponseDto.from(inquiry);
    }

    private Inquiry findInquiry(Long inquiryId) {
        return inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new BusinessException("문의를 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 사용자입니다.", ErrorCode.NOT_FOUND));
    }
}
