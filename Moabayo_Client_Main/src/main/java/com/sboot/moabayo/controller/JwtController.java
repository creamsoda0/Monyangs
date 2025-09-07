package com.sboot.moabayo.controller;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sboot.moabayo.feign.JwtFeignClient;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class JwtController {

    private final JwtFeignClient jwtFeignClient;   // 외부 검증
    private final ObjectMapper om = new ObjectMapper();

    @GetMapping("/jwt/verify")
    public ResponseEntity<String> verifyCardAccess(HttpServletRequest request, HttpServletResponse response) {
        // 1) 토큰 꺼내기 (헤더 → 쿠키)
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        } else if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("ACCESS_TOKEN".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }

        if (token == null || token.isBlank()) {
            return ResponseEntity.status(401).body("토큰 없음 또는 잘못된 형식");
        }

        try {
            // 2) 외부 검증 호출
            var feignRes = jwtFeignClient.verifyToken("Bearer " + token);
            if (!feignRes.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(feignRes.getStatusCode()).body("인증 실패");
            }

            // 3) exp 추출 (JWT 형식 수비)
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return ResponseEntity.status(401).body("잘못된 토큰 형식");
            }
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JsonNode payload = om.readTree(payloadJson);
            
            String loginId = PickId(payload);
            System.out.println(loginId);
            long expSec = payload.path("exp").asLong(0);
            long nowSec = System.currentTimeMillis() / 1000;
            long remainSec = Math.max(0, expSec - nowSec);
            if (remainSec == 0) {
                return ResponseEntity.status(401).body("토큰 만료");
            }

            // 4) ACCESS_TOKEN (HttpOnly) & 5) EXP (비-HttpOnly)
            ResponseCookie access = ResponseCookie.from("ACCESS_TOKEN", token)
                    .httpOnly(true)
                    .secure(false)     // HTTPS면 true
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofSeconds(remainSec))
                    .build();
            ResponseCookie expCookie = ResponseCookie.from("EXP", String.valueOf(expSec))
                    .httpOnly(false)
                    .secure(false)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofSeconds(remainSec))
                    .build();

            // 6) 쿠키 + 본문 + 캐시방지 헤더
            response.addHeader("Set-Cookie", access.toString());
            response.addHeader("Set-Cookie", expCookie.toString());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .body(feignRes.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(403).body("인증 실패: " + e.getMessage());
        }
    }

	private String PickId(JsonNode payload) {
		// TODO Auto-generated method stub
		return null;
	}
}
