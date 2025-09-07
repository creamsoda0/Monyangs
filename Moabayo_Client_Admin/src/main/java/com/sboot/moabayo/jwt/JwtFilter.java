package com.sboot.moabayo.jwt;

import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException, java.io.IOException {

    String auth = req.getHeader("Authorization");
    if (auth == null) { // URL 파라미터 허용(원하면)
      String p = req.getParameter("token");
      if (p != null && p.startsWith("Bearer ")) auth = p;
    }

    if (auth != null && auth.startsWith("Bearer ")) {
      String token = auth.substring(7);
      // 1) 토큰 검증 (서명/만료/Roles)
      // 2) UsernamePasswordAuthenticationToken 생성해서 SecurityContext에 set
    }
    chain.doFilter(req, res);
  }
}
