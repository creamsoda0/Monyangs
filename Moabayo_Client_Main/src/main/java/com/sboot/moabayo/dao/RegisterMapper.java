package com.sboot.moabayo.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sboot.moabayo.vo.UserVO;

@Mapper
public interface RegisterMapper {

	void insertUser(UserVO vo);
	
	int countByLoginId(@Param("loginId") String loginId);
    
}