package com.sboot.moabayo.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sboot.moabayo.vo.UserDetailVO;

@Mapper
public interface UserDetailMapper {
	UserDetailVO findUserDetailByLoginId(@Param("loginId") String loginId);
}
