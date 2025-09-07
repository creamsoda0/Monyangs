package com.sboot.moabayo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sboot.moabayo.dao.LoginMapper;
import com.sboot.moabayo.vo.UserVO;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private LoginMapper loginMapper;

    @Override
    public UserVO login(String loginId) {
        return loginMapper.findByLoginId(loginId);
    }
}