package com.sboot.moabayo.service;

import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.UserDetailMapper;
import com.sboot.moabayo.vo.UserDetailVO;

@Service
public class UserDetailService {
	UserDetailMapper udmapper;
	
	public UserDetailVO findUserDetailByLoginId(String loginId) {
		return udmapper.findUserDetailByLoginId(loginId);
	};
}
