package com.sboot.moabayo.dao;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserCardMapper {
	int countByUserId(Long userId);
}