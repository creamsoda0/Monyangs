package com.sboot.moabayo.controller;

import java.util.Date;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sboot.moabayo.jwt.JwtGenerate;
import com.sboot.moabayo.service.LoginService;
import com.sboot.moabayo.vo.LoginFormVO;
import com.sboot.moabayo.vo.UserInfoVO;
import com.sboot.moabayo.vo.UserVO;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/user")
public class LoginCheckController {

	private final LoginService loginService;
	private final PasswordEncoder passwordEncoder;

	public LoginCheckController(LoginService loginService, PasswordEncoder passwordEncoder) {
		this.loginService = loginService;
		this.passwordEncoder = passwordEncoder;
	}

	@PostMapping("/login")
	public ResponseEntity<UserInfoVO> validate(@RequestBody LoginFormVO form, HttpServletResponse response) {
		UserVO user = loginService.login(form.getId());

		if (user != null && passwordEncoder.matches(form.getPw(), user.getPassword())) {
			String token = JwtGenerate.createToken(user.getUserId(), user.getLoginId());
			String refreshToken = JwtGenerate.createRefreshToken(user.getUserId(), user.getLoginId());

			// JWT 토큰에서 만료 시간 추출 (만료시간은 UNIX timestamp 초 단위)
			Claims claims = Jwts.parserBuilder().setSigningKey(JwtGenerate.getKey()) // 비밀키 필요
					.build().parseClaimsJws(token).getBody();
			Date expiration = claims.getExpiration(); // Date 타입

			// expiration 시간 UNIX timestamp(초)로 변환
			long expSeconds = expiration.getTime() / 1000;

			// ===== 쿠키 설정 =====
			Cookie accessCookie = new Cookie("ACCESS_TOKEN", token);
			accessCookie.setHttpOnly(true);
			accessCookie.setSecure(true);
			accessCookie.setPath("/");
			accessCookie.setMaxAge(600); // 10분

			Cookie refreshCookie = new Cookie("REFRESH_TOKEN", refreshToken);
			refreshCookie.setHttpOnly(true);
			refreshCookie.setSecure(true);
			refreshCookie.setPath("/");
			refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7일

			Cookie userNameCookie = new Cookie("USER_NAME", user.getName());
			userNameCookie.setHttpOnly(false);
			userNameCookie.setPath("/");
			userNameCookie.setMaxAge(600);
			
			Cookie userIdCookie = new Cookie("USER_ID", String.valueOf(user.getUserId()));
			userIdCookie.setHttpOnly(false);
			userIdCookie.setPath("/");
			userIdCookie.setMaxAge(600);

			Cookie loginStatusCookie = new Cookie("LOGGED_IN", "true");
			loginStatusCookie.setHttpOnly(false);
			loginStatusCookie.setPath("/");
			loginStatusCookie.setMaxAge(600);

			// **EXP 쿠키 추가 (HttpOnly false로 JS 접근 가능하게)**
			Cookie expCookie = new Cookie("EXP", String.valueOf(expSeconds));
			expCookie.setHttpOnly(false); // JS에서 읽기 위해 반드시 false여야 함
			expCookie.setPath("/");
			expCookie.setMaxAge((int) ((expiration.getTime() - System.currentTimeMillis()) / 1000)); // 남은 시간 초 단위로 설정

			response.addCookie(userIdCookie);
			response.addCookie(accessCookie);
			response.addCookie(refreshCookie);
			response.addCookie(userNameCookie);
			response.addCookie(loginStatusCookie);
			response.addCookie(expCookie); // 추가된 쿠키

			// ===== 응답 헤더에 JWT 토큰 추가 =====
			HttpHeaders headers = new HttpHeaders();
			headers.add("Authorization", "Bearer " + token);
			headers.add("Refresh-Token", refreshToken);

			// ===== 사용자 정보 응답 바디 생성 =====
			UserInfoVO info = new UserInfoVO(user.getUserId(), user.getLoginId(), user.getName(), user.getIsAdmin());

			return ResponseEntity.ok().headers(headers).body(info);
		}

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	}
}