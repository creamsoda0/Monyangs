package com.sboot.moabayo.jwt;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class MoaJwtFilter extends OncePerRequestFilter {

    private final MoaJwtGenerate jwtUtil;

    public MoaJwtFilter(MoaJwtGenerate jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private static final String BEARER = "Bearer ";
    private static final AntPathMatcher matcher = new AntPathMatcher();

    // ✅ 토큰 없이 열어둘 경로(필요에 맞게 조정)
    private static final String[] OPEN = {
        "/jwt/**",          // 8812에서 쓰는 검증/로그인용 엔드포인트
        "/loginpage",
        "/error",
        "/favicon.ico",
        "/css/**", "/js/**", "/images/**", "/webjars/**"  // 정적 리소스
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String uri = request.getRequestURI();

        // 🔓 화이트리스트는 통과 (루트 / 도 여기에 없으면 보호됨)
        for (String p : OPEN) {
            if (matcher.match(p, uri)) {
                chain.doFilter(request, response);
                return;
            }
        }

        // 🔐 나머지 모든 경로는 인증 필요(= /** 전체 보호)
        String authHeader = request.getHeader("Authorization");

        // Authorization 없으면 쿠키 ACCESS_TOKEN에서 시도
        if (authHeader == null || !authHeader.startsWith(BEARER)) {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie c : cookies) {
                    if ("ACCESS_TOKEN".equals(c.getName())) {
                        authHeader = BEARER + c.getValue();
                        break;
                    }
                }
            }
        }

        if (authHeader == null || !authHeader.startsWith(BEARER)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        try {
            String token = authHeader.substring(BEARER.length()).trim();
            // 서명/만료 검증
            Jwts.parserBuilder()
                .setSigningKey(jwtUtil.getKey())
                .build()
                .parseClaimsJws(token);

            chain.doFilter(request, response); // ✅ 통과
        } catch (JwtException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
        }
    }
}
