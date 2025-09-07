package com.sboot.moabayo.jwt;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class BankJwtGenerate {

    private static final String SECRET = "ThisIsASecretKeyThatMustBeOver32Characters!";
    private final static Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    private static final long ACCESS_EXPIRATION_TIME = 1000 * 60 * 10;
    private static final long REFRESH_EXPIRATION_TIME = 1000L * 60 * 60 * 24 * 7;

    public String createToken(String username) {
        return Jwts.builder()	
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION_TIME))
            .signWith(key)
            .compact();
    }

    public String createRefreshToken(String username) {
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION_TIME))
            .signWith(key)
            .compact();
    }

    public static Key getKey() {
        return key;
    }
}
