package com.sboot.moabayo.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sboot.moabayo.vo.TxnRowVO;

@Mapper
public interface TransactionMapper {
	// 그냥 전체 계좌 조회하기
	List<TxnRowVO> findHistory(@Param("userId") Long userId);
}
