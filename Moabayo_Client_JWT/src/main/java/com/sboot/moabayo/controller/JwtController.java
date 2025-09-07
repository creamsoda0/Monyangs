package com.sboot.moabayo.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory; // 로그 관련 import 추가
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sboot.moabayo.jwt.MoaJwtGenerate;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/jwt")
public class JwtController {

	private final MoaJwtGenerate jwtGenerate;
	private static final Logger logger = LoggerFactory.getLogger(JwtController.class); // Logger 생성

	public JwtController(MoaJwtGenerate jwtGenerate) {
		this.jwtGenerate = jwtGenerate;
	}

	@GetMapping("/check")
	public ResponseEntity<?> checkToken(HttpServletRequest request) {
		try {
			String token = extractToken(request);
			logger.debug("Token extracted: {}", token); // 토큰 로그 출력

			if (token == null) {
				logger.warn("No token found in request");
				return ResponseEntity.status(401).body("No token");
			}

			Claims claims = Jwts.parserBuilder().setSigningKey(jwtGenerate.getKey()) // ✅ 오류 해결
					.build().parseClaimsJws(token).getBody();

			Long userId = claims.get("userId", Long.class);
			String userName = claims.getSubject();

			logger.info("Token valid for userId: {}, userName: {}", userId, userName);

			Map<String, Object> result = new HashMap<>();
			result.put("userId", userId);
			result.put("name", userName);

			return ResponseEntity.ok(result);

		} catch (Exception e) {
			logger.error("Invalid token: {}", e.getMessage());
			return ResponseEntity.status(401).body("Invalid token");
		}
	}

	// 기존 verify 유지
	@GetMapping("/verify")
	public ResponseEntity<String> verifyToken() {
		logger.info("/jwt/verify called");
		return ResponseEntity.ok().build();
	}

	// 공통: 헤더 또는 쿠키에서 토큰 추출
	private String extractToken(HttpServletRequest request) {
		String auth = request.getHeader("Authorization");
		if (auth != null && auth.startsWith("Bearer ")) {
			return auth.substring(7);
		}

		// 쿠키에서 추출
		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if ("ACCESS_TOKEN".equals(cookie.getName())) {
					return cookie.getValue();
				}
			}
		}

		return null;
	}
}
