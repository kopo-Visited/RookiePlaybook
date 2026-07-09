package com.visited.www.notice.service;

import com.visited.www.entity.User;
import com.visited.www.global.exception.BusinessException;
import com.visited.www.global.exception.ErrorCode;
import com.visited.www.notice.dto.request.NoticeCreateRequestDto;
import com.visited.www.notice.dto.request.NoticeUpdateRequestDto;
import com.visited.www.notice.dto.response.NoticeResponseDto;
import com.visited.www.notice.entity.Notice;
import com.visited.www.notice.repository.NoticeRepository;
import com.visited.www.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NoticeResponseDto> getRecentNotices() {
        return noticeRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(NoticeResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NoticeResponseDto> getAllNotices() {
        return noticeRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(NoticeResponseDto::from)
                .toList();
    }

    public NoticeResponseDto create(Long writerId, NoticeCreateRequestDto request) {
        User writer = getUser(writerId);

        Notice notice = Notice.builder()
                .writer(writer)
                .title(request.title())
                .content(request.content())
                .build();

        return NoticeResponseDto.from(noticeRepository.save(notice));
    }

    public NoticeResponseDto update(Long noticeId, NoticeUpdateRequestDto request) {
        Notice notice = findNotice(noticeId);
        notice.update(request.title(), request.content());
        return NoticeResponseDto.from(notice);
    }

    public void delete(Long noticeId) {
        noticeRepository.delete(findNotice(noticeId));
    }

    private Notice findNotice(Long noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException("공지사항을 찾을 수 없습니다.", ErrorCode.NOT_FOUND));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 사용자입니다.", ErrorCode.NOT_FOUND));
    }
}
