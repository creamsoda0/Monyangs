	package com.sboot.moabayo.jwt;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class MoaJwtGenerate {

	private static final String SECRET = "ThisIsASecretKeyThatMustBeOver32Characters!";
	private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

	private static final long ACCESS_EXPIRATION_TIME = 1000 * 60 * 10; // 10분
	private static final long REFRESH_EXPIRATION_TIME = 1000L * 60 * 60 * 24 * 7; // 7일

	public String createToken(Long userId, String username) {
		return Jwts.builder().setSubject(String.valueOf(userId)) // userId 저장
				.claim("username", username) // 추가 클레임
				.setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION_TIME))
				.signWith(key).compact();
	}

	public String createRefreshToken(String username) {
		return Jwts.builder().setSubject(username).setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION_TIME)).signWith(key).compact();
	}

	public Key getKey() {
		return key;
	}
}
