package com.sboot.moabayo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.RegisterMapper;
import com.sboot.moabayo.vo.UserVO;

@Service
public class RegisterService {

	@Autowired
	private RegisterMapper registerMapper;
	
    // 회원가입 처리
    public void register(UserVO vo) {
    	registerMapper.insertUser(vo);
    }

    // 아이디 중복 체크
    public boolean isLoginIdExists(String id) {
        return registerMapper.countByLoginId(id) > 0;
    }
}
