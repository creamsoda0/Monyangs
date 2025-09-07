package com.sboot.moabayo.service;

import org.springframework.stereotype.Service;

import com.sboot.moabayo.vo.UserVO;

@Service
public interface LoginService {

	/*
	 * @Autowired private LoginMapper loginMapper;
	 */

	UserVO login(String loginId);
		
		
	
	
	
}
