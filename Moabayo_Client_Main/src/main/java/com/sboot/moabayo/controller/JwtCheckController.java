// com.sboot.moabayo.controller.JwtCheckController
package com.sboot.moabayo.controller;

import java.util.Arrays;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/jwt")
public class JwtCheckController {

    //  쿠키 이름은 실제 내려주는 이름 (
    private static final String TOKEN_COOKIE = "ACCESS_TOKEN";

    private String getCookie(HttpServletRequest req, String name) {
        if (req.getCookies() == null) return null;
        return Arrays.stream(req.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    @GetMapping("/check")
    public ResponseEntity<?> check(HttpServletRequest request) {
        // 1) 쿠키에 토큰이 있으면 로그인으로 간주 (검증 X)
        String token = getCookie(request, TOKEN_COOKIE);

        // 2) (옵션) 헤더에 Authorization이 있으면 그것도 인정
        if (token == null || token.isBlank()) {
            String auth = request.getHeader("Authorization"); // Bearer ...
            if (auth != null && !auth.isBlank()) token = auth;
        }

        if (token == null || token.isBlank()) {
            return ResponseEntity.status(401).body("No token");
        }

        // 여기서는 진짜 검증은 안 하고, 화면용 더미 유저만 내려줍니다.
        return ResponseEntity.ok(
		   Map.of("id", "user", "name", "사용자", "role", "USER")
        );
    }
}
