package com.sboot.moabayo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.sboot.moabayo.service.MypageService;
import com.sboot.moabayo.vo.SummaryVO;
import com.sboot.moabayo.vo.UserVO;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class MyPageController {

	private final MypageService mypageservice; // ★ final 로!

	@GetMapping("/mypagesummary")
	public SummaryVO getSummary(HttpServletRequest request) {
		String userId = extractCookie(request, "USER_ID");
		if (userId == null)
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

		SummaryVO vo = new SummaryVO();
		vo.setAsset(mypageservice.getSumBalance(userId));
		vo.setAccounts(mypageservice.getAccountCount(userId));
		vo.setCards(mypageservice.getCardCount(userId));
		return vo;
	}

	@GetMapping("/profile")
	public UserVO getProfile(@CookieValue(name = "USER_ID", required = false) Long userId) {
		if (userId == null)
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		return mypageservice.getProfile(userId);
	}

	@PostMapping("/profile")
	public Map<String, Object> saveProfile(@CookieValue(name = "USER_ID", required = false) Long userId,
			@RequestBody UserVO req) {
		System.out.println(userId);
		if (userId == null)
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

		if ((req.getNewPw() != null || req.getNewPwConfirm() != null)) {
			if (req.getNewPw() == null || req.getNewPwConfirm() == null
					|| !req.getNewPw().equals(req.getNewPwConfirm())) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다.");
			}
			if (req.getNewPw().length() < 8) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호는 8자 이상이어야 합니다.");
			}
		}

		mypageservice.updateProfile(userId, req);
		return Map.of("success", true);
	}

	// 공통 쿠키 헬퍼 (선택)
	private String extractCookie(HttpServletRequest request, String name) {
		if (request.getCookies() == null)
			return null;
		for (var c : request.getCookies())
			if (name.equals(c.getName()))
				return c.getValue();
		return null;
	}
}
