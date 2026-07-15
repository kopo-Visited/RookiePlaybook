package com.visited.www.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visited.www.entity.User;
import com.visited.www.entity.UserStatus;
import com.visited.www.global.exception.ErrorCode;
import com.visited.www.global.response.ApiResponse;
import com.visited.www.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    /*
     * 초기/임시 비밀번호(User.passwordChangeRequired=true) 상태에서도 반드시 열려있어야
     * 하는 경로. SecurityConfig의 permitAll 경로(인증 자체가 필요없는 요청 - 예: 재로그인
     * 시도)와, 비밀번호를 실제로 바꾸기 위한 경로/로그아웃을 포함한다. SecurityConfig의
     * permitAll 목록이 바뀌면 이 목록도 함께 맞춰야 한다.
     */
    private static final Set<String> PASSWORD_CHANGE_EXEMPT_PATHS = Set.of(
            "/api/health",
            "/api/auth/login",
            "/api/notices",
            "/api/account-unlock-requests",
            "/api/users/me/password",
            "/api/auth/logout"
    );

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token = resolveToken(request);

        if (token != null && jwtProvider.isValid(token)) {
            Claims claims = jwtProvider.parseClaims(token);
            Long userId = Long.valueOf(claims.getSubject());
            String roleCode = claims.get("roleCode", String.class);

            // 토큰 발급 이후 계정이 잠기거나(LOCKED) 비활성화돼도 만료 전까지 계속
            // 인증되는 것을 막기 위해 매 요청마다 현재 계정 상태를 확인한다.
            User user = userRepository.findById(userId).orElse(null);

            if (user != null && user.getStatus() == UserStatus.ACTIVE) {
                if (user.isPasswordChangeRequired() && !PASSWORD_CHANGE_EXEMPT_PATHS.contains(request.getRequestURI())) {
                    respondPasswordChangeRequired(response);
                    return;
                }

                var authentication = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of(new SimpleGrantedAuthority(roleCode))
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void respondPasswordChangeRequired(HttpServletResponse response) throws IOException {
        response.setStatus(ErrorCode.PASSWORD_CHANGE_REQUIRED.getStatus().value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                objectMapper.writeValueAsString(ApiResponse.fail(ErrorCode.PASSWORD_CHANGE_REQUIRED))
        );
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER_NAME);
        if (header != null && header.startsWith(TOKEN_PREFIX)) {
            return header.substring(TOKEN_PREFIX.length());
        }
        return null;
    }
}
