package com.visited.www.global.response;

import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;

/**
 * API 명세서의 페이징 응답 형식.
 * { "content": [...], "page": 0, "totalPages": 1, "totalElements": 1 }
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int totalPages,
        long totalElements
) {
    public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements()
        );
    }
}
