package com.sboot.moabayo.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sboot.moabayo.vo.UserVO;

@Mapper
public interface LoginMapper {
    UserVO findByLoginId(@Param("loginId") String loginId);
}