package com.sboot.moabayo.jwt;


import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class BankJwtFilter extends OncePerRequestFilter {

    private final BankJwtGenerate jwtUtil;

    public BankJwtFilter(BankJwtGenerate jwtUtil) {
        this.jwtUtil = jwtUtil;  // ✅ 생성자 주입
    }

    private static final String BEARER ="Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException, java.io.IOException {

        String uri = request.getRequestURI();

        if (uri.startsWith("/secure")) {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith(BEARER)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Authorization header missing or invalid.");
                return;
            }

            try {
                String token = authHeader.substring(BEARER.length());
                Jwts.parserBuilder()
                        .setSigningKey(jwtUtil.getKey()) // ✅ 수정 완료
                        .build()
                        .parseClaimsJws(token);

                filterChain.doFilter(request, response); // 통과
            } catch (JwtException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token.");
            }

        } else {
            filterChain.doFilter(request, response); // 인증 필요 없음
        }
    }
}
