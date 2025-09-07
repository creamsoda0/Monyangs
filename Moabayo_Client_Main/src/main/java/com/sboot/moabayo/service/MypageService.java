package com.sboot.moabayo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.MyPageMapper;
import com.sboot.moabayo.vo.UserVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MypageService {

	@Autowired
	private final MyPageMapper mypagemapper;
	private final PasswordEncoder passwordEncoder; // BCryptPasswordEncoder 빈 등록
	
	public int getSumBalance(String userId) {
			
		return mypagemapper.selectSumBalance(userId);
	}

	public int getAccountCount(String userId) {
		// TODO Auto-generated method stub
		return mypagemapper.selectAccountCount(userId);
	}

	public int getCardCount(String userId) {
		// TODO Auto-generated method stub
		return mypagemapper.selectCardCount(userId);
	}

	public UserVO getProfile(Long userId) {
		// TODO Auto-generated method stub
		return mypagemapper.selectProfile(userId);
	}

	public void updateProfile(Long userId, UserVO req) {
		// TODO Auto-generated method stub
		mypagemapper.updateProfile(userId, req);
	    // 비밀번호 변경 의사 있으면 해시 후 업데이트
	    if (req.getNewPw() != null && !req.getNewPw().isBlank()) {
	      String enc = passwordEncoder.encode(req.getNewPw());
	      mypagemapper.updatePassword(userId, enc);
	}

	}
}