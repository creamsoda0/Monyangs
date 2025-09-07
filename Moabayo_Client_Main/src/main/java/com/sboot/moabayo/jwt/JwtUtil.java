package com.sboot.moabayo.jwt;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // ✅ 실제 환경에선 환경변수나 yml에서 가져오세요!
    private final String secret = "moabayo-jwt-secret-key-moabayo-jwt-secret-key"; // 최소 256bit
    private final long expirationTime = 1000 * 60 * 60 * 2; // 2시간

    public Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ✅ 토큰 생성
    public String generateToken(String userId, String role) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ 토큰에서 Claims 추출
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            getClaims(token); // 파싱이 성공하면 유효한 것
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ✅ 토큰에서 사용자 ID 추출
    public String getUserId(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ 토큰에서 역할(role) 추출
    public String getRole(String token) {
        return (String) getClaims(token).get("role");
    }
}
